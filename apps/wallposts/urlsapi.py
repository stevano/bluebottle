from django.conf.urls import patterns, url
from .views import WallPostList, WallPostDetail, MediaWallPostList

urlpatterns = patterns('',
    url(r'^$', WallPostList.as_view(), name='wallpost-list'),
    url(r'^mediawallposts/$', MediaWallPostList.as_view(), name='media-wallpost-list'),
    url(r'^(?P<pk>[0-9]+)$', WallPostDetail.as_view(), name='wallpost-detail'),
)
