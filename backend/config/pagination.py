# À placer par exemple dans un nouveau fichier config/pagination.py
from rest_framework.pagination import PageNumberPagination

class StandardPagination(PageNumberPagination):
    page_size_query_param = 'page_size'
    max_page_size = 100