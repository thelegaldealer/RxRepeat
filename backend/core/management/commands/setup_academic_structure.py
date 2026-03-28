from django.core.management.base import BaseCommand
from core.models import University, Course, CourseTab


class Command(BaseCommand):
    help = 'Sets up the initial academic structure: University of Reading + MPHARM 2 course with default tabs.'

    def handle(self, *args, **options):
        # --- Create University ---
        university, uni_created = University.objects.get_or_create(
            name='University of Reading',
            defaults={
                'website': 'https://www.reading.ac.uk',
            }
        )
        if uni_created:
            self.stdout.write(self.style.SUCCESS('University created: %s' % university.name))
        else:
            self.stdout.write(self.style.WARNING('University already exists: %s (ID: %s)' % (university.name, university.id)))

        # --- Create Course ---
        course, course_created = Course.objects.get_or_create(
            code='MPHARM2',
            university=university,
            defaults={
                'name': 'MPHARM 2',
                'description': 'Master of Pharmacy - Year 2',
            }
        )
        if course_created:
            self.stdout.write(self.style.SUCCESS('Course created: %s (%s)' % (course.name, course.code)))
            # The post_save signal should have auto-created the 4 tabs.
            tabs = CourseTab.objects.filter(course=course)
            self.stdout.write(self.style.SUCCESS('  -> %d default tab(s) auto-created by signal:' % tabs.count()))
            for tab in tabs:
                self.stdout.write('      - %s (type: %s)' % (tab.name, tab.tab_type))
        else:
            self.stdout.write(self.style.WARNING('Course already exists: %s (%s, ID: %s)' % (course.name, course.code, course.id)))
            # Ensure all 4 tabs exist (in case the course was created before the signal was updated)
            default_tabs = [
                ('Content', 'content'),
                ('Flashcards', 'flashcards'),
                ('Practice Papers', 'practice_papers'),
                ('Contact an Expert', 'contact_expert'),
            ]
            for tab_name, tab_type in default_tabs:
                tab, tab_created = CourseTab.objects.get_or_create(
                    course=course,
                    tab_type=tab_type,
                    defaults={'name': tab_name}
                )
                if tab_created:
                    self.stdout.write(self.style.SUCCESS('  [+] Missing tab created: %s' % tab_name))
                else:
                    self.stdout.write('  [ok] Tab exists: %s' % tab_name)

        # --- Summary ---
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('=== Academic Structure Summary ==='))
        self.stdout.write('  University: %s (ID: %s)' % (university.name, university.id))
        self.stdout.write('  Course:     %s [%s] (ID: %s)' % (course.name, course.code, course.id))
        total_tabs = CourseTab.objects.filter(course=course).count()
        self.stdout.write('  Tabs:       %d' % total_tabs)
        for tab in CourseTab.objects.filter(course=course):
            self.stdout.write('              - %s (%s)' % (tab.name, tab.tab_type))
        self.stdout.write(self.style.SUCCESS('================================='))
