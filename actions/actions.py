import sqlite3
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.events import SlotSet
from fuzzywuzzy import process

class ActionGetCourseInfoFromDB(Action):
    def name(self) -> Text:
        return "action_check_course_name_exists"

    def run(self, dispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        course_name = tracker.slots["course_name"]
        conn = sqlite3.connect("courses.db")
        c = conn.cursor()

        # Retrieve all course titles from the database
        c.execute("SELECT title FROM courses")
        course_titles = [row[0] for row in c.fetchall()]

        # Use fuzzy matching to find the closest matching course
        best_match = process.extractOne(course_name, course_titles, score_cutoff=80)

        if best_match:
            best_match_title = best_match[0]
            c.execute("SELECT * FROM courses WHERE title =?", (best_match_title,))
            course_info = c.fetchone()
            if course_info:
                course_code, course_title, course_type, ects, semester = course_info

                # Query the instructors table to get all instructors for the course
                c.execute("SELECT instructor FROM instructors WHERE code =?", (course_code,))
                instructors = [row[0] for row in c.fetchall()]
                instructor_string = ", ".join(instructors)

                conn.close()
                return [
                    SlotSet("course_code", course_code),
                    SlotSet("course_name", course_title),
                    SlotSet("course_type", course_type),
                    SlotSet("course_ects", ects),
                    SlotSet("course_semester", semester),
                    SlotSet("course_teacher_info", instructor_string),
                    SlotSet("course_name_exists", True)
                ]
        else:
            return [
                SlotSet("course_teacher_info", []),
                SlotSet("course_name_exists", False)
            ]
        



class ActionRetrieveCourseDescription(Action):
    def name(self) -> Text:
        return "action_retrieve_course_description"

    def run(self, dispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        course_code = tracker.slots["course_code"]
        conn = sqlite3.connect("courses.db")
        c = conn.cursor()

        c.execute("SELECT description FROM descriptions WHERE code =?", (course_code,))
        course_description = c.fetchone()
        if course_description:
            course_description = course_description[0].replace("\r\n", " ")

        conn.close()
        return [SlotSet("course_description", course_description)]



class ActionRetrieveElearning(Action):
    def name(self) -> Text:
        return "action_retrieve_elearning"

    def run(self, dispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        course_code = tracker.slots["course_code"]
        conn = sqlite3.connect("courses.db")
        c = conn.cursor()

        c.execute("SELECT elearning FROM elearnings WHERE code =?", (course_code,))
        elearning_link = c.fetchone()
        if elearning_link:
            elearning_link = elearning_link[0]

        conn.close()
        return [SlotSet("course_elearning", elearning_link)]

class ActionRetrieveEcts(Action):
    def name(self) -> Text:
        return "action_retrieve_ects"

    def run(self, dispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        course_name = tracker.slots["course_name"]
        conn = sqlite3.connect("courses.db")
        c = conn.cursor()

        c.execute("SELECT ects FROM courses WHERE title =?", (course_name,))
        ects = c.fetchone()
        if ects:
            ects = ects[0]

        conn.close()
        return [SlotSet("course_ects", ects)]


class ActionRetrieveSemester(Action):
    def name(self) -> Text:
        return "action_retrieve_semester"

    def run(self, dispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        course_name = tracker.slots["course_name"]
        conn = sqlite3.connect("courses.db")
        c = conn.cursor()

        c.execute("SELECT semester FROM courses WHERE title =?", (course_name,))
        semester = c.fetchone()
        if semester:
            semester = semester[0]

        conn.close()
        return [SlotSet("course_semester", semester)]