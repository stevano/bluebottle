from django.contrib.contenttypes.models import ContentType
from django.db import models, IntegrityError
from django.db.models.query import QuerySet
from django.utils.encoding import force_unicode


class LoveDeclarationQueryMixin(object):
    """
    Shared methods for the LoveDeclaration.objects API (both manager and queryset) to support chaining.
    """
    # QueryMixin design thanks to http://hunterford.me/django-custom-model-manager-chaining/
    # Methods based on https://github.com/liberation/django-favorites

    def by_user(self, user):
        """
        Returns LoveDeclaration objects for a specific user
        """
        return self.filter(user=user)


    def for_model(self, model):
        """
        QuerySet for all LoveDeclarations for a particular model (either an instance or a class).
        """
        ct = ContentType.objects.get_for_model(model)
        qs = self.get_query_set().filter(content_type=ct)
        if isinstance(model, models.Model):
            qs = qs.filter(object_id=force_unicode(model._get_pk_val()))
        return qs


    def for_objects(self, object_list, user=None):
        """
        Get a dictionary mapping object ids to favorite of votes for each object.
        """
        object_ids = [o.pk for o in object_list]  # Fetch full objects, assumes the object list is also read elsewhere.
        if not object_ids:
            return {}

        content_type = ContentType.objects.get_for_model(object_list[0])

        qs = self.filter(content_type=content_type, object_id__in=object_ids)
        counters = qs.values('object_id').annotate(count=models.Count('object_id'))

        results = {}
        for counter in counters:
            results[counter['object_id']] = {
                'count': counter['count'],
                'is_loved': False,
                'content_type_id': content_type.id,
            }

        if user and user.is_authenticated():
            qs = qs.filter(user=user)
            for f in qs:
                results.setdefault(f.object_id, {})['is_loved'] = True

        return results

    def for_content_type(self, content_type):
        """ QuerySet for all LoveDeclarations for particular content_type. """

        return self.get_query_set().filter(content_type=content_type)


class LoveDeclarationManagerQuerySet(LoveDeclarationQueryMixin, QuerySet):
    """ QuerySet chaining methods for ``LoveDeclaration.objects``. """

    pass


class LoveDeclarationManager(LoveDeclarationQueryMixin, models.Manager):
    """
    Methods for ``LoveDeclaration.objects``.
    """

    def get_query_set(self):
        return LoveDeclarationManagerQuerySet(self.model, using=self._db)


    def mark_as_loved(self, content_object, user):
        """
        Mark an object as loved.
        """
        args = dict(
            user=user,
            content_type=ContentType.objects.get_for_model(type(content_object)),
            object_id=content_object.pk
        )

        try:
            return self.get_or_create(**args)
        except IntegrityError:
            # Close call, got race condition.
            return self.get(**args)


    def unmark_as_loved(self, content_object, user):
        """
        Unmark an object as loved.
        """
        self.for_model(content_object).by_user(user).delete()


    mark_as_loved.alters_data = True
    unmark_as_loved.alters_data = True
