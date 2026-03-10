from django.utils import timezone


def aplicar_filtro_periodo(queryset, data_inicio=None, data_fim=None):
    """
    Aplica filtro de período em qualquer queryset com campo criado_em.
    """

    if data_inicio:
        queryset = queryset.filter(criado_em__date__gte=data_inicio)

    if data_fim:
        queryset = queryset.filter(criado_em__date__lte=data_fim)

    return queryset
