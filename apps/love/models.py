from django.contrib.auth.models import User
from django.contrib.contenttypes.generic import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.utils.translation import ugettext_lazy as _
from django_extensions.db.fields import CreationDateTimeField
from apps.love.managers import LoveDeclarationManager


class LoveDeclaration(models.Model):
    """
    A "like" or "favourite" marker expressed by the user for a given object.
    """
    content_type = models.ForeignKey(ContentType)
    # TODO: should this be object_id? change reactions??
    object_id = models.PositiveIntegerField(_('object ID'))
    content_object = GenericForeignKey('content_type', 'object_id')

    created = CreationDateTimeField(_('created'))
    user = models.ForeignKey(User, editable=False)

    objects = LoveDeclarationManager()


    class Meta:
        verbose_name = _('Love')
        verbose_name_plural = _('Loves')
        unique_together = ('user', 'content_type', 'object_id')

    def __unicode__(self):
        object_repr = unicode(self.content_object)
        return u"{0} loves {1}".format(self.user, object_repr)
