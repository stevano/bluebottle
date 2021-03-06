from apps.accounts.models import BlueBottleUser
from apps.bluebottle_drf2.serializers import SorlImageField
from apps.geo.models import Country
from apps.geo.serializers import CountrySerializer
from django import forms
from django.contrib.auth.forms import PasswordResetForm
from django.contrib.sites.models import Site
from django.core.exceptions import ObjectDoesNotExist
from django.utils.translation import ugettext as _
from registration.models import RegistrationProfile
from rest_framework import serializers


class UserPreviewSerializer(serializers.ModelSerializer):
    """
    Serializer for a subset of a member's public profile. This is usually embedded into other serializers.
    """
    avatar = SorlImageField('picture', '90x90', crop='center', colorspace="GRAY")

    class Meta:
        model = BlueBottleUser
        fields = ('id', 'first_name', 'last_name', 'username', 'avatar',)


class CurrentUserSerializer(UserPreviewSerializer):
    """
    Serializer for the current authenticated user. This is the same as the serializer for the member preview with the
    addition of id_for_ember.
    """
    # This is a hack to work around an issue with Ember-Data keeping the id as 'current'.
    id_for_ember = serializers.IntegerField(source='id', read_only=True)

    class Meta:
        model = BlueBottleUser
        fields = UserPreviewSerializer.Meta.fields + ('id_for_ember',)


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for a member's public profile.
    """
    url = serializers.HyperlinkedIdentityField(view_name='user-profile-detail')
    avatar = SorlImageField('picture', '100x100', colorspace="GRAY", required=False, read_only=True)
    picture = SorlImageField('picture', '240x240', required=False)
    date_joined = serializers.DateTimeField(read_only=True)
    username = serializers.CharField(read_only=True)

    class Meta:
        model = BlueBottleUser
        # TODO: Add * Your skills,
        #           * interested in themes
        #           * interested in countries
        #           * interested in target groups
        fields = ('id', 'url', 'username', 'first_name', 'last_name', 'avatar', 'picture', 'about', 'why', 'website',
                  'availability', 'date_joined', 'location')


# Thanks to Neamar Tucote for this code:
# https://groups.google.com/d/msg/django-rest-framework/abMsDCYbBRg/d2orqUUdTqsJ
class PasswordField(serializers.CharField):
    """ Special field to update a password field. """
    widget = forms.widgets.PasswordInput
    hidden_password_string = '********'

    def from_native(self, value):
        """ Hash if new value sent, else retrieve current password. """
        from django.contrib.auth.hashers import make_password
        if value == self.hidden_password_string or value == '':
            return self.parent.object.password
        else:
            return make_password(value)

    def to_native(self, value):
        """ Hide hashed-password in API display. """
        return self.hidden_password_string


class UserSettingsCountryField(serializers.PrimaryKeyRelatedField):
    def __init__(self, *args, **kwargs):
        super(UserSettingsCountryField, self).__init__(queryset=Country.objects, *args, **kwargs)

    def field_to_native(self, obj, field_name):
        try:
            address = obj.address
            pk = getattr(address, self.source.replace('address.', '')).pk
        except (AttributeError, ObjectDoesNotExist):
            return None

        return self.to_native(pk)


class UserSettingsSerializer(serializers.ModelSerializer):
    """
    Serializer for viewing and editing a user's settings. This should only be accessible to authenticated users.
    """
    # FIXME: We should really be serializing 'birthdate' as a DateField but that would require some additional work
    #        in our ember-data adapter. This could cause birthdate's to not be savable in some cases.
    birthdate = serializers.DateTimeField(required=False)
    email = serializers.EmailField(required=False)

    # Address
    line1 = serializers.CharField(source='address.line1', max_length=100, blank=True)
    line2 = serializers.CharField(source='address.line2', max_length=100, blank=True)
    city = serializers.CharField(source='address.city', max_length=100, blank=True)
    state = serializers.CharField(source='address.state', max_length=100, blank=True)
    country = UserSettingsCountryField(source='address.country', blank=True)
    postal_code = serializers.CharField(source='address.postal_code', max_length=20, blank=True)

    class Meta:
        model = BlueBottleUser
        # TODO: Add * password update using password field.
        #           * Facebook connect
        fields = ('id', 'email', 'share_time_knowledge', 'share_money', 'newsletter', 'gender', 'birthdate',
                  'user_type', 'line1', 'line2', 'city', 'state', 'postal_code', 'country')

    def restore_object(self, attrs, instance=None):
        """ Overridden to enable address write."""
        instance = super(UserSettingsSerializer, self).restore_object(attrs, instance)

        address_fields = dict((key.replace('address.', ''), val) for key, val in attrs.items() if key.startswith('address.'))
        address = instance.address
        if address is not None:
            for key, val in address_fields.items():
                setattr(address, key, val)
            address.save()

        return instance


class UserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating users. This can only be used for creating users (POST) and should not be used for listing,
    editing or viewing users.
    """
    email = serializers.EmailField(required=True, max_length=254)
    password = PasswordField(required=True, max_length=128)
    username = serializers.CharField(read_only=True)

    class Meta:
        model = BlueBottleUser
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'password')

    def save(self):
        """
        Setup the newly created user for activation. We're not using
        'RegistrationProfile.objects.create_inactive_user()' from django-registration because it requires a username.
        """
        # Ensure User is inactive
        self.object.is_active = False
        self.object.save()

        # Create a RegistrationProfile and email its activation key to the User.
        registration_profile = RegistrationProfile.objects.create_profile(self.object)
        site = Site.objects.get_current()
        registration_profile.send_activation_email(site)


class PasswordResetSerializer(serializers.Serializer):
    """
    Password reset request serializer that uses the email validation from the Django PasswordResetForm.
    """
    email = serializers.EmailField(required=True, max_length=254)

    class Meta:
        fields = ('email',)

    def __init__(self, password_reset_form=None, *args, **kwargs):
        self.password_reset_form = password_reset_form
        super(PasswordResetSerializer, self).__init__(*args, **kwargs)

    def validate_email(self, attrs, source):
        if attrs is not None:  # Don't need this check in newer versions of DRF2.
            value = attrs[source]
            self.password_reset_form.cleaned_data = {"email": value}
            return self.password_reset_form.clean_email()


class PasswordSetSerializer(serializers.Serializer):
    """
    A serializer that lets a user change set his/her password without entering the old password. This uses the
    validation from the Django SetPasswordForm.
    """
    # We can't use the PasswordField here because it hashes the passwords with a salt which means we can't compare the
    # two passwords to see if they are the same.
    new_password1 = serializers.CharField(required=True, max_length=128, widget=forms.widgets.PasswordInput)
    new_password2 = serializers.CharField(required=True, max_length=128, widget=forms.widgets.PasswordInput)

    class Meta:
        fields = ('new_password1', 'new_password2')

    def __init__(self, password_set_form=None, *args, **kwargs):
        self.password_set_form = password_set_form
        super(PasswordSetSerializer, self).__init__(*args, **kwargs)

    def validate_new_password2(self, attrs, source):
        if attrs is not None:  # Don't need this check in newer versions of DRF2.
            value = attrs[source]
            self.password_set_form.cleaned_data = {"new_password1": attrs['new_password1'], "new_password2": value}
            return self.password_set_form.clean_new_password2()