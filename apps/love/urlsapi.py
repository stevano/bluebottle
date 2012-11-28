from django.conf.urls import patterns, url
from .views import LoveList, LoveDetail

urlpatterns = patterns('loves',
    url(r'^$', LoveList.as_view(), name='love-list'),
    url(r'^(?P<pk>[0-9]+)$', LoveDetail.as_view(), name='love-detail'),
)
