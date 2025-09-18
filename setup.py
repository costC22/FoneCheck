from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="fonecheck",
    version="1.0.0",
    author="FoneCheck Team",
    description="FoneCheck - Sistema de busca de telefones",
    long_description=long_description,
    long_description_content_type="text/markdown",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: End Users/Desktop",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
    python_requires=">=3.10",
    install_requires=[
        "Flask==2.2.5",
        "pandas==1.5.3",
        "openpyxl==3.0.10",
        "gunicorn==20.1.0",
        "numpy==1.24.3",
        "Werkzeug==2.2.3",
    ],
)
