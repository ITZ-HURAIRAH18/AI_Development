import pandas as pd

# data = {
#     "Name": ["Ali", "Ahmed", "Sara", "John", "Fatima"],
#     "Age": [22, 25, 21, 30, 24],
#     "City": ["Lahore", "Karachi", "Lahore", "Islamabad", "Karachi"],
#     "Salary": [50000, 65000, 45000, 80000, 60000],
#     "Department": ["IT", "HR", "IT", "Finance", "HR"]
# }

# df = pd.DataFrame(data)

# print(df)


# names = pd.Series(["Ali", "Ahmed", "Sara", "John"])

# print(names)

result = df[df["Salary"] > 60000]

print(result)