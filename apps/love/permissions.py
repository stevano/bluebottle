
from rest_framework import permissions

class IsCreatorOrReadOnly(permissions.BasePermission):
    """
    Custom permission to allow users to only delete their own loves.
    """

    def has_permission(self, request, view, obj=None):
        # Skip the check unless this is an object-level test.
        if obj is None:
            return True

        # Read permissions are allowed to any request.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the user of the love.
        return obj.user == request.user
