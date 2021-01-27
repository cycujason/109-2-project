'''''
use ml-latest-small dataset
'''''


import csv
from py2neo import *

graph = Graph(host="localhost", username="movies", password="1234")


def test():
    with open('movies.csv',newline='',encoding='UTF-8') as files:
       rows = csv.reader(files)
       for row in rows:
            print(row[2].split('|'))
            print(row[1].split('(')[0])
            if len(row[1].split('(')) > 1:
               print(row[1][-5:-1])                # print to check the data style


def graph_test():
    count = 0
    with open('movies.csv', newline='', encoding='UTF-8') as files:
        rows = csv.reader(files)
        for row in rows:
            if count == 100:
                break
            if row[1] != "title":                     # to avoid the first line of all data
                cnode1 = Node('MOVIE', ID=row[0], title=row[1].split('(')[0])
                graph.create(cnode1)
                if len(row[1].split('(')) > 1:          # data have include year
                    cnode2 = graph.nodes.match('YEAR', year=row[1][-5:-1]).first()
                    if cnode2 is None:
                        cnode2 = Node('YEAR', year=row[1][-5:-1])
                    related = Relationship(cnode1, 'YEAR_IN', cnode2)
                    graph.create(cnode2)
                    graph.create(related)             # to build year point or connect movie title with year data
                genres = row[2].split('|')
                for genre in genres:
                    cnode3 = graph.nodes.match('GENRE', genre=genre).first()
                    if cnode3 is None:
                        cnode3 = Node('GENRE', genre=genre)
                    related = Relationship(cnode1, 'HAVE_GENRE', cnode3)
                    graph.create(cnode3)
                    graph.create(related)            # to connect the genre to movie
            count = count + 1


if __name__ == '__main__':
    graph_test()