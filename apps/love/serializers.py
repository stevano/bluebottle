from apps.love.models import LoveDeclaration
from rest_framework import serializers


class LoveDetailSerializer(serializers.ModelSerializer):
    created = serializers.Field()
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = LoveDeclaration
        fields = ('created', 'user', 'id')


class LoveListSerializer(LoveDetailSerializer):

    class Meta:
        model = LoveDeclaration
        fields = ('id',)
