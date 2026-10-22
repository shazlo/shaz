from django.core.management.base import BaseCommand

from shazlo.core.observability import setup


class Command(BaseCommand):
    help = "Consume the swipe Redis Stream (consumer group) and batch-insert into Postgres."

    def handle(self, *args: object, **options: object) -> None:
        setup("shazlo-consumer")
        raise NotImplementedError("consume_swipes")
