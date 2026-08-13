# import numpy as np

# Arrays

# a = np.array([10, 20, 30, 40])

# print(a)

# 1D array

# a = np.array([1, 2, 3, 4])

# 2D
# a = np.array([
#     [1, 2, 3],
#     [4, 5, 6]
# ])

# 3D

        # a = np.array([
        #     [[1, 2], [3, 4]],
        #     [[5, 6], [7, 8]]
        # ])

    #      3D ARRAY

    #   ┌─────────────┐
    #   │ 1   2       │
    #   │ 3   4       │   ← 2D array #1
    #   └─────────────┘

    #   ┌─────────────┐
    #   │ 5   6       │
    #   │ 7   8       │   ← 2D array #2
    #   └─────────────┘

# Indexing 

# a = np.array([10, 20, 30, 40, 50])

# print(a[0])
# print(a[2])


# a = np.array([
#     [10, 20, 30],
#     [40, 50, 60]
# ])

# print(a[0, 1])

# Output:20
#        col
#         0   1   2
# row 0  10  20  30
# row 1  40  50  60

#Reshapping

# a = np.array([1, 2, 3, 4, 5, 6])
# b = a.reshape(2, 3)
# b=a.reshape(3, 2)
# print(b)


# Broadcasting
# a = np.array([1, 2, 3])

# print(a + 10)


# a = np.array([
#     [1, 2, 3],
#     [4, 5, 6]
# ])

# b = np.array([10, 20, 30])

# print(a + b)


# Vectorization

# Without vectorization:

# numbers = [1, 2, 3, 4, 5]

# result = []

# for x in numbers:
#     result.append(x * 2)

# print(result)


# With NumPy:

# numbers = np.array([1, 2, 3, 4, 5])

# result = numbers * 2

# print(result)

# Output:

# [2 4 6 8 10]


# Matrix Multiplication

# A = np.array([
#     [1, 2],
#     [3, 4]
# ])

# B = np.array([
#     [5, 6],
#     [7, 8]
# ])

# C = A @ B

# print(C)

# The calculation is:

# 1×5 + 2×7 = 19
# 1×6 + 2×8 = 22

# 3×5 + 4×7 = 43
# 3×6 + 4×8 = 50


# You can also use:

# np.matmul(A, B)

# Important distinction

# Don't confuse:

# A * B

# with:

# A @ B

# * → element-by-element multiplication

# @ → matrix multiplication


# Aggregation Functions
# a = np.array([10, 20, 30, 40, 50])
# print(np.sum(a))  # Output: 150


# Random Sampling


# a=np.random.randint(1, 10)
# a=np.random.randint(1, 20, 5)
print(a)



#                     NumPy
#                       │
#                       ▼
#                    Arrays
#                       │
#           ┌───────────┴───────────┐
#           ▼                       ▼
#      Dimensions                Indexing
#           │                       │
#           ▼                       ▼
#       Reshaping              Data Access
#           │
#           ▼
#     Broadcasting
#           │
#           ▼
#      Vectorization
#           │
#           ▼
#  Matrix / Vector Operations
#           │
#           ▼
#    Aggregation + Statistics
#           │
#           ▼
#     Random Sampling
#           │
#           ▼
#       Machine Learning