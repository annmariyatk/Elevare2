from django.core.management.base import BaseCommand
from django.utils import timezone
from students.models import StudyConnection, Teacher

class Command(BaseCommand):
    help = "Release teachers after study end_date"

    def handle(self, *args, **kwargs):
        today = timezone.now().date()

        studies = StudyConnection.objects.filter(
            status__in=["Started", "Progress"],
            end_date__lt=today,
            teacher__isnull=False
        )

        count = 0
        for s in studies:
            teacher = s.teacher
            teacher.status = 0
            teacher.save()
            count += 1

        self.stdout.write(self.style.SUCCESS(f"✅ Released {count} teachers"))
