from django_filters import FilterSet, filters


class ProfileSearchFilter(FilterSet):
    type = filters.CharFilter(field_name="type", lookup_expr="exact")
    aid = filters.CharFilter(field_name="aid_type__name", lookup_expr="exact")


class TransactionSearchFilter(FilterSet):
    hash = filters.CharFilter(field_name="hash", lookup_expr="contains")
    from_user = filters.CharFilter(
        field_name="from_user__email", lookup_expr="contains"
    )
    to = filters.CharFilter(field_name="to__email", lookup_expr="contains")
    event = filters.CharFilter(field_name="event", lookup_expr="contains")
    since = filters.DateTimeFilter(field_name="timestamp", lookup_expr="gte")
    until = filters.DateTimeFilter(field_name="timestamp", lookup_expr="lte")


class PDFFilter(FilterSet):
    user = filters.CharFilter(field_name="from_user__email", lookup_expr="contains")
    since = filters.DateTimeFilter(field_name="timestamp", lookup_expr="gte")
    until = filters.DateTimeFilter(field_name="timestamp", lookup_expr="lte")
