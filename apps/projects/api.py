from django.db.models import Q, Count
from django.conf.urls.defaults import *
from django.core.paginator import Paginator, InvalidPage
from django.http import Http404
from django.core.serializers import serialize
from django.utils import simplejson

from tastypie.resources import ModelResource, Resource
from tastypie import fields, utils
from tastypie.authorization import DjangoAuthorization
from tastypie.utils import trailing_slash
from tastypie.paginator import Paginator

from .models import Project, IdeaPhase, PlanPhase, ActPhase, ResultsPhase, ProjectCategory

class ResourceBase(ModelResource):
    class Meta:

        authorization = DjangoAuthorization()
        list_allowed_methods = ['get']
        detail_allowed_methods = ['get']


class ProjectSearchFormResource(Resource):
    def dehydrate(self, bundle):
        bundle = bundle.obj
        return bundle

    def obj_get_list(self, request):
        countries = Project.objects.values('country').annotate(count=Count('country')).order_by('country')
        categories = Project.objects.values('categories__name').filter(categories__isnull=False).annotate(count=Count('categories')).order_by('categories__name')
        countries = simplejson.dumps(list(countries))
        categories = simplejson.dumps(list(categories))
        items = [
                    ('countries', countries),
                    ('categories', categories)
                 ]
        return items

    class Meta:
        limit = 0

class ProjectResource(ResourceBase):
# Might want to use this later
# However it does not work if the related Phase doesn't exist...
#
#    ideaphase = fields.OneToOneField(
#                 'apps.projects.api.IdeaPhaseResource', 'ideaphase', full=True)
#    planphase = fields.OneToOneField(
#                 'projects.api.PlanPhaseResource', 'planphase', full=False)
#    actphase = fields.OneToOneField(
#                'projects.api.ActPhaseResource', 'actphase', full=False)
#    resultsphase = fields.OneToOneField(
#                'projects.api.ResultsPhaseResource', 'resultsphase', full=False)

    def dehydrate(self, bundle):
        bundle.data['location'] = bundle.obj.location()
        bundle.data['money_donated'] = bundle.obj.money_donated()
        bundle.data['money_asked'] = bundle.obj.money_asked()
        bundle.data['money_needed'] = bundle.obj.money_needed()
        return bundle

    class Meta:
        queryset = Project.objects.all()
        filtering = {
             "latitude": ('gte', 'lte'),
             "longitude": ('gte', 'lte'),
             "title": ('istartswith', 'icontains'),
             "country": ('icontains'),
        }

    def filter_text(self, query):
        """ Custom filter for free text search. """
        query = query.replace('+', ' ')
        qset = (
                Q(title__icontains=query) |
                Q(actphase__description__icontains=query) |
                Q(planphase__description__icontains=query) |
                Q(planphase__what__icontains=query) |
                Q(planphase__goal__icontains=query) |
                Q(planphase__who__icontains=query) |
                Q(planphase__how__icontains=query) |
                Q(planphase__sustainability__icontains=query) |
                Q(planphase__target__icontains=query) |
                Q(slug__icontains=query)
                )
        return qset

    def filter_phases(self, phases):
        qset = (Q(phase__in=phases))
        return qset


    def apply_filters(self, request, applicable_filters):
        """ Apply custom filters """
        """ Get the objects with standard filters """
        filtered_objects = super(ProjectResource, self).apply_filters(request, applicable_filters)

        text = request.GET.get('text', None)
        if text:
            filtered_objects = filtered_objects.filter(self.filter_text(text))

        phases = request.GET.getlist('phases[]', None)
        if phases:
            filtered_objects = filtered_objects.filter(phase__in=phases)

        languages = request.GET.getlist('languages[]', None)
        if languages:
            filtered_objects = filtered_objects.filter(project_language__in=languages)

        themes = request.GET.getlist('themes[]', None)
        if themes:
            categories = ProjectCategory.objects.filter(slug__in=themes)
            filtered_objects = filtered_objects.filter(categories__in=categories)


        return filtered_objects


class IdeaPhaseResource(ResourceBase):
    project = fields.OneToOneField(ProjectResource, 'project')

    class Meta:
        queryset = IdeaPhase.objects.select_related('IdeaPhase').all()


class PlanPhaseResource(ResourceBase):
    project = fields.OneToOneField(ProjectResource, 'project')

    class Meta:
        queryset = PlanPhase.objects.all()


class ActPhaseResource(ResourceBase):
    project = fields.OneToOneField(ProjectResource, 'project')

    class Meta:
        queryset = ActPhase.objects.all()


class ResultsPhaseResource(ResourceBase):
    project = fields.OneToOneField(ProjectResource, 'project')

    class Meta:
        queryset = ResultsPhase.objects.all()


