from django.db.models import Q, Count, Sum
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
from sorl.thumbnail import get_thumbnail


from .models import Project, IdeaPhase, PlanPhase, ActPhase, ResultsPhase, ProjectCategory

class ResourceBase(ModelResource):
    class Meta:

        authorization = DjangoAuthorization()
        list_allowed_methods = ['get']
        detail_allowed_methods = ['get']



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
        """ Add some more fields to project objects """
        bundle.data['location'] = bundle.obj.location()
        bundle.data['money_donated'] = bundle.obj.money_donated()
        bundle.data['money_asked'] = bundle.obj.money_asked()
        bundle.data['money_needed'] = bundle.obj.money_needed()
        try:
            bundle.data['thumbnail'] = '/static/media/' + unicode(
                                             get_thumbnail(bundle.obj.image,
                                            '225x150', crop='center', quality=85))
        except:
            bundle.data['thumbnail'] = 'http://placehold.it/225x150'

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

        categories = request.GET.getlist('categories[]', None)
        if categories:
            filtered_objects = filtered_objects.filter(categories__slug__in=categories)

        tags = request.GET.getlist('tags[]', None)
        if tags:
            filtered_objects = filtered_objects.filter(tags__slug__in=tags)

        order = request.GET.get('order', None)
        if order == 'alphabetically':
            filtered_objects = filtered_objects.order_by('title')
        if order == 'newest':
            filtered_objects = filtered_objects.order_by('-created')


        return filtered_objects


class ProjectSearchFormResource(Resource):
    """ 
        Have a separate resource for Search Form
        We want to keep track of the number of projects per option
    """

    def create_element(self, objects, title, slug, type, filter,
                       name_field=None, slug_field=None, order=None, limit=0):
        """ Create a form element """
        if type in ['select', 'radio', 'checkbox']:
            options = objects
            if slug_field == None:
                slug_field = name_field
            options = options.values_list(name_field, slug_field)
            if order:
                options = options.order_by(order)
            options = options.annotate(count=Count('slug'))
            if limit:
                options = options[0:limit]
            options = simplejson.dumps(list(options))
            element = (title,
                         {
                             'name': slug,
                             'filter': filter,
                             'options': options,
                             'type': type
                         })
        else:
            element = (title,
                         {
                             'name': slug,
                             'filter': filter,
                             'type': type
                         })

        return element


    def dehydrate(self, bundle):
        bundle = bundle.obj
        return bundle

    def obj_get_list(self, request):
        projects = Project.objects


        text = self.create_element(projects,
                            'Text Search', 'text',
                            'text', 'text')


        phases = self.create_element(projects,
                            'Project Phase', 'phases',
                            'checkbox', 'phase',
                            'phase', 'phase', 'phase')

        countries = self.create_element(projects,
                            'Country', 'countries',
                            'select', 'country__contains',
                            'country', 'country', 'country')

        themes = self.create_element(projects.filter(categories__isnull=False),
                            'Themes', 'categories',
                            'checkbox', 'categories',
                            'categories__name', 'categories__slug', 'categories__name')

        tags = self.create_element(projects.filter(tags__isnull=False),
                            'Tags', 'tags',
                            'checkbox', 'tags',
                            'tags__name', 'tags__slug', '-count', 20)

        items = [text, phases, countries, themes, tags]
        return items


    class Meta:
        limit = 0

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


