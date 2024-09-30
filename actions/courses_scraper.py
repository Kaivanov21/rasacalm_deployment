import requests
from bs4 import BeautifulSoup
import sqlite3

url = "https://qa.auth.gr/el/studyguide/600000438/current?sort=code&order=asc&erasmus=all-courses&classes=2&aco=2&ccf=all-courses&paf=all-courses&cpx=complex-courses&cols=ects%231%231_attendanceType%231%232_languagesInstr%230%236_languagesExams%230%237_activities%230%238_faculty%231%239_common-courses%230%2310_pedagogic-adequacy%230%2311_weekly-hours%230%2312_total-hours%230%2313"

response = requests.get(url)
soup = BeautifulSoup(response.content, 'html.parser')

courses = []
instructors = []
descriptions = []
elearning_links = []

for i, table in enumerate(soup.find_all('table', class_='sortable-datatable courses-per-orientation columns-5')):
    semester = i + 1
    for row in table.find_all('tr')[1:]:  # skip the header row
        # Scrape basic information
        code = row.find('td', class_='code').get_text()
        title = row.find('td', class_='title').get_text()
        ects = row.find('td', class_='ects').get_text()
        course_type = row.find('td', class_='type').get_text()
        instructors_td = row.find('td', class_='instructors')
        instructors_list = [a.text for a in instructors_td.find_all('a', href=True)]
        courses.append((code, title, course_type, ects, semester))
        for instructor in instructors_list:
            instructors.append((code, instructor))

        # Scrape the course description
        course_id = row.get('id')
        course_url = f"https://qa.auth.gr/el/class/1/{course_id}"
        course_response = requests.get(course_url)
        course_soup = BeautifulSoup(course_response.content, 'html.parser')
        description_div = course_soup.find('div', id='course-elem-course-content-syllabus')
        if description_div:
            description = description_div.find('div', class_='value').get_text()
            descriptions.append((code, description))

        # Scrape the elearning link
        elearning_link = 'https://elearning.auth.gr/'  # Set default link
        elearning_link_div = course_soup.find('div', string='Ηλεκτρονική Διάθεση Μαθήματος')
        if elearning_link_div:
            elearning_link_ul = elearning_link_div.find_next('ul')
            elearning_link_li = elearning_link_ul.find(lambda li: 'eLearning (Moodle)' in li.text)
            if elearning_link_li:
                temp_link = elearning_link_li.find('a')['href']
                if temp_link.startswith('https://elearning.auth.gr/course/view.php?id='):
                    elearning_link = temp_link
        elearning_links.append((code, elearning_link))

print("Courses:")
for course in courses:
    print(f"Code: {course[0]}, Title: {course[1]}, Type: {course[2]}, ECTS: {course[3]}")

# Create a connection to the SQLite database
conn = sqlite3.connect('courses.db')
cur = conn.cursor()

# Drop tables if exists
cur.execute('''DROP TABLE IF EXISTS courses''')
cur.execute('''DROP TABLE IF EXISTS instructors''')
cur.execute('''DROP TABLE IF EXISTS descriptions''')
cur.execute('''DROP TABLE IF EXISTS elearnings''')

# Create tables
cur.execute('''CREATE TABLE IF NOT EXISTS courses
             (code TEXT PRIMARY KEY, title TEXT, course_type TEXT, ects TEXT, semester TEXT)''')
cur.execute('''CREATE TABLE IF NOT EXISTS instructors
             (code TEXT, instructor TEXT)''')
cur.execute('''CREATE TABLE IF NOT EXISTS descriptions
             (code TEXT, description TEXT)''')
cur.execute('''CREATE TABLE IF NOT EXISTS elearnings
             (code TEXT, elearning TEXT)''')

# Insert data into tables
cur.executemany('INSERT INTO courses(code, title, course_type, ects, semester) VALUES (?,?,?,?,?)', courses)
cur.executemany('INSERT INTO instructors VALUES (?,?)', instructors)
cur.executemany('INSERT INTO descriptions VALUES (?,?)', descriptions)
cur.executemany('INSERT INTO elearnings VALUES (?,?)', elearning_links)

# Commit the changes and close the connection
conn.commit()
conn.close()