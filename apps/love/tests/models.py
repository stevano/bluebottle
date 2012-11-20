from django.db import models


class TestBlogPost(models.Model):
    """
    A model that is used for testing.
    """
    title = models.CharField(max_length=200)
    slug = models.SlugField()

    def __unicode__(self):
        return self.title

