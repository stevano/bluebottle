from django.conf.urls.defaults import patterns, url, include

from surlex.dj import surl

from .api import ProjectResource, ProjectMembersResource, IdeaPhaseResource
from .views import ProjectListView, ProjectDetailView, ProjectMapView, ProjectPicturesView, ProjectSearchView

project_resource = ProjectResource()
projectmembers_resource = ProjectMembersResource()
ideaphase_resource = IdeaPhaseResource()


urlpatterns = patterns('apps.projects.views',
    surl(r'^$', ProjectListView.as_view(), name='list'),
    surl(r'^search/$', ProjectSearchView.as_view(), name='search'),
    surl(r'^<slug:s>/$', ProjectDetailView.as_view(), name='detail'),
    surl(r'^<slug:s>/map/$', ProjectMapView.as_view(), name='map'),
    surl(r'^<slug:s>/pictures/$', ProjectPicturesView.as_view(), name='pictures'),
)

# API urls
urlpatterns += patterns('',
    url(r'^api/', include(project_resource.urls)),
    url(r'^api/', include(projectmembers_resource.urls)),
    url(r'^api/', include(ideaphase_resource.urls)),
)

