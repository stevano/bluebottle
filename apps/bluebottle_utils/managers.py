from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.utils.encoding import force_unicode


class GenericForeignKeyManagerMixin(object):
    """
    Manager for models that use generic foreign keys based on CommentManager from django.crontrib.comments.
    """

    def for_model(self, model):
        """
        QuerySet for all objects for a particular model (either an instance or a class).
        """
        ct = ContentType.objects.get_for_model(model)
        qs = self.get_query_set().filter(content_type=ct)
        if isinstance(model, models.Model):
            qs = qs.filter(object_id=force_unicode(model._get_pk_val()))
        return qs

    def for_content_type(self, content_type):
        """
        QuerySet for all models for particular content_type.
        """
        return self.get_query_set().filter(content_type=content_type)
    
    def for_type_and_id(self, **kwargs):
        if not kwargs.get('type'):
            raise Exception("type (content_type model name) not set")
        if not kwargs.get('id'):
            raise Exception("id (object_id) not set")
            type = self.request.QUERY_PARAMS['type']
        id = kwargs.get('id')
        content_type = ContentType.objects.get(model=type)
        return self.filter(content_type=content_type, object_id=id)
