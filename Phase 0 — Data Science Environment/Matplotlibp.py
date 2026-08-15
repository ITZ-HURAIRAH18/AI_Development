# import matplotlib.pyplot as plt

# marks = [45, 50, 52, 55, 55, 58, 60, 62, 65, 68,
#          70, 72, 72, 75, 78, 80, 82, 85, 90, 95]

# plt.hist(marks, bins=5)

# plt.xlabel("Marks")
# plt.ylabel("Number of Students")
# plt.title("Distribution of Students' Marks")

# plt.show()




# distributions



# import matplotlib.pyplot as plt

# marks = [40, 45, 48, 50, 52, 55, 57, 60, 62, 65, 68, 70, 72, 75, 95]

# plt.boxplot(marks)

# plt.ylabel("Marks")
# plt.title("Students' Marks")

# plt.show()



# box plots










# import matplotlib.pyplot as plt

# class_A = [45, 50, 52, 55, 60, 62, 65, 68]
# class_B = [55, 58, 60, 65, 67, 70, 72, 75]
# class_C = [40, 45, 48, 50, 52, 55, 90]

# data = [class_A, class_B, class_C]

# plt.boxplot(data, labels=["Class A", "Class B", "Class C"])

# plt.ylabel("Marks")
# plt.title("Marks Distribution by Class")

# plt.show()

# scatter plots





# import matplotlib.pyplot as plt

# study_hours = [1, 2, 3, 4, 5, 6, 7, 8]
# marks = [40, 45, 50, 55, 60, 68, 75, 85]

# plt.scatter(study_hours, marks)

# plt.xlabel("Study Hours")
# plt.ylabel("Marks")
# plt.title("Study Hours vs Marks")

# plt.show()







# correlation matrices


# import pandas as pd
# import matplotlib.pyplot as plt

# data = {
#     "Age": [20, 22, 25, 28, 30],
#     "Salary": [30000, 35000, 40000, 50000, 60000],
#     "Experience": [1, 2, 3, 5, 7],
#     "Marks": [80, 75, 85, 90, 95]
# }

# df = pd.DataFrame(data)

# correlation = df.corr()

# print(correlation)



# histograms




# import matplotlib.pyplot as plt

# marks = [45, 50, 52, 55, 55, 58, 60, 62, 65,
#          68, 70, 72, 72, 75, 78, 80, 85, 90, 95]

# plt.hist(marks)

# plt.xlabel("Marks")
# plt.ylabel("Number of Students")
# plt.title("Distribution of Students' Marks")

# plt.show()