import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from students.models import StudyConnection, StudentSkill, Student

def check_study(study_id):
    try:
        study = StudyConnection.objects.get(study_id=study_id)
        print(f"Study ID: {study.study_id}")
        print(f"Status: {study.status}")
        print(f"Student1: {study.student1.username} (ID: {study.student1_id})")
        print(f"Student2: {study.student2.username} (ID: {study.student2_id})")
        print(f"Student1 Skill: {study.student1_skill_id}")
        print(f"Student2 Skill: {study.student2_skill_id}")
        
        if study.student1_skill:
            s1s = study.student1_skill
            print(f"Skill 1: offer={s1s.offer}, want={s1s.want}, status={s1s.status}")
        
        if study.student2_skill:
            s2s = study.student2_skill
            print(f"Skill 2: offer={s2s.offer}, want={s2s.want}, status={s2s.status}")

        skills_assigned = bool(study.student1_skill or study.student2_skill)
        print(f"skills_assigned (bool): {skills_assigned}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_study(47)
