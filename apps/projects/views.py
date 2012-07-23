from django.views.generic import ListView, DetailView

from .models import Project


class ProjectViewBase(object):
    model = Project


class ProjectListView(ProjectViewBase, ListView):
    pass


class ProjectDetailView(ProjectViewBase, DetailView):
    pass


class ProjectMapView(ProjectViewBase, DetailView):
    template_name = "projects/map.html"


class ProjectPicturesView(ProjectViewBase, DetailView):
    template_name = "projects/pictures.html"

class ProjectSearchView(ProjectViewBase, ListView):
    template_name = "projects/search.html"


