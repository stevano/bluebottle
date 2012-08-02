from django.db.models import Q
from django.conf.urls.defaults import *
from django.core.paginator import Paginator, InvalidPage
from django.http import Http404

from tastypie.resources import ModelResource
from tastypie import fields, utils
from tastypie.authorization import DjangoAuthorization
from tastypie.utils import trailing_slash

from .models import Project, IdeaPhase, PlanPhase, ActPhase, ResultsPhase

class ResourceBase(ModelResource):
    class Meta:
        authorization = DjangoAuthorization()
        list_allowed_methods = ['get']
        detail_allowed_methods = ['get']


# TODO: Change this resource so it returns members (Duh!)
class ProjectMembersResource(ResourceBase):

    class Meta:
        queryset = Project.objects.filter(phase='plan').all()



class ProjectResource(ResourceBase):
# Might want to use this later
# However it does not work if the related Phasedoesn't exist...
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
        queryset = Project.objects.filter(phase='plan').all()
        filtering = {
             "latitude": ('gte', 'lte'),
             "longitude": ('gte', 'lte'),
             "title": ('istartswith', 'icontains'),
             "country": ('icontains'),
        }


    def build_filters(self, filters=None):
        if filters is None:
            filters = {}
        orm_filters = super(ProjectResource, self).build_filters(filters)
        if('phase' in filters):
            """ Phases filter """
            query = filters['phase']
            qset = (phase in query)
            orm_filters['custom'] = qset

        if('text' in filters):
            """ Custom filter for free text search. """
            query = filters['text']
            # replaces +s with spaces due to jQuery serialize 
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
            orm_filters['custom'] = qset
        return orm_filters

    def apply_filters(self, request, applicable_filters):
        """ Apply custom filters """
        if 'custom' in applicable_filters:
            custom = applicable_filters.pop('custom')
        else:
            custom = None

        semi_filtered = super(ProjectResource, self).apply_filters(request, applicable_filters)

        return semi_filtered.filter(custom) if custom else semi_filtered


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


