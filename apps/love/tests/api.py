from apps.blogs.views import BlogPostList, BlogPostDetail
from apps.bluebottle_utils.tests import BlogPostCreationMixin
from django.test import TestCase
from rest_framework import status


class LoveApiIntegrationTest(BlogPostCreationMixin, TestCase):
    """
    Integration tests for the LoveDeclaration API.
    """
    # TODO: Add a test for love on another type of content.

    def setUp(self):
        self.blogpost = self.create_blogpost()
        self.user2 = self.create_user()
        self.user2.save()
        self.blog_api_base = '/i18n/api/blogs/'
        self.love_api_name = '/loves/'
        self.loves_url = "{0}{1}{2}".format(self.blog_api_base, self.blogpost.slug, self.love_api_name)
        self.client.login(username=self.user2.username, password='password')

    def tearDown(self):
        self.client.logout()

    def test_love_crd(self):
        """
        Tests for creating, retrieving and deleting a love.
        """

        # Create love.
        response = self.client.post(self.loves_url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)

        # Retrieve love.
        love_detail_url = "{0}{1}".format(self.loves_url, str(response.data['id']))
        response = self.client.get(love_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertEqual(response.data['user'], self.user2.id)

        # Delete love.
        response = self.client.delete(love_detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT, response)


#    def test_loves_on_multiple_objects(self):
#        """
#        Tests for multiple loves and unauthorized love updates.
#        """
#
#        # Create two loves.
#        love_text_1 = 'Great job!'
#        response = self.client.post(self.loves_url, {'love': love_text_1})
#        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
#        self.assertEqual(response.data['love'], love_text_1)
#
#        love_text_2 = 'This is a really nice post.'
#        response = self.client.post(self.loves_url, {'love': love_text_2})
#        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
#        self.assertEqual(response.data['love'], love_text_2)
#
#        # Check the size of the love list is correct.
#        response = self.client.get(self.loves_url)
#        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
#        self.assertEqual(response.data['count'], 2)
#
#        # Create a love on second blog post.
#        second_blogpost = self.create_blogpost(title='Ben Jij Rijk?')
#        second_loves_url = "{0}{1}{2}".format(self.api_base, second_blogpost.slug, self.love_api_name)
#        love_text_3 = 'Super!'
#        response = self.client.post(second_loves_url, {'love': love_text_3})
#        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
#        self.assertEqual(response.data['love'], love_text_3)
#        # Save the detail url to be used in the authorization test below.
#        second_love_detail_url = "{0}{1}".format(second_loves_url, response.data['id'])
#
#        # Check that the size and data in the first love list is correct.
#        response = self.client.get(self.loves_url)
#        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
#        self.assertEqual(response.data['count'], 2)
#        self.assertEqual(response.data['results'][1]['love'], love_text_1)
#        self.assertEqual(response.data['results'][0]['love'], love_text_2)
#
#        # Check that the size and data in the second love list is correct.
#        response = self.client.get(second_loves_url)
#        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
#        self.assertEqual(response.data['count'], 1)
#        self.assertEqual(response.data['results'][0]['love'], love_text_3)
#
#        # Test that a love update from a user who is not the author is forbidden.
#        self.client.logout()
#        self.client.login(username=second_blogpost.author.username, password='password')
#        response = self.client.post(second_love_detail_url, {'love': 'Can I update this love?'})
#        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED, response.data)
