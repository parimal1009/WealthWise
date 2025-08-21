INTERPRETER_USER_REQUEST = """
You are an assistant that classifies user requests.

Inputs:
- user_message: "{user_message}"
- has_uploaded_document: {has_uploaded_document}   # true or false

Your task:
Carefully interpret the user_message and Classify the request into ONE of the following categories:

1. INCOMPLETE_REQUEST  
   - The message is garbage and unclear.  

2. QUESTION  
   - The user is asking a question. 
   - Example: "What is the best payout option?" 

4. EXTRACT_USER_INFO_FROM_DOCUMENT  
   - The user explicitly requests extracting their personal information from the uploaded document.  
   - Example: "Extract my details from this document"

5. GENERAL
   - User typed something general like greetings.
   - Example: "Hello"

Output your classification in JSON format as:
{{
  "category": "<one_of_the_three_categories>",
}}

Note: Do not reply anything other than the json.
"""

ANSWER_USER_QUERY_PROMPT = """
You are an assistant for a Pension Optimizer platform. 
Your job is to answer user questions by utilizing the provided context. 

Inputs:
- Context: 
{context}

- Question: "{user_query}"

Guidelines:
1. Use the context above when answering. 
2. Always try to answer by understanding the context but If the context is very low to come up with any conclusion then, respond with I would need more information and list what input would be required.
3. Be concise, clear, and professional. Avoid unnecessary details.  
4. Try to help user as much as possible by answering in best possible way.
5. In your answer also provide your reasoning behind it.

answer: "<direct and clear response to the question>"
"""

EXTRACT_USER_INFO_PROMPT = """
You are an expert data extraction assistant. Your task is to extract specific user information from the provided document text.

Document Text:
{document_text}

Extract the following information if available in the document. Only include fields that you can find with high confidence. Return values without units (just numbers where applicable):

Personal Details:
- name: Full name of the person
- age: Age in years (number only)
- dateOfBirth: Date of birth (format: YYYY-MM-DD if possible)
- gender: Male/Female/Other
- location: City, State, or Country
- maritalStatus: Single/Married/Divorced/Widowed
- numberOfDependants: Number of dependents (number only)

Income Status:
- currentSalary: Current annual salary (number only)
- yearsOfService: Years of work experience (number only)
- employerType: Government/Private/Self-employed
- pensionScheme: Name of pension scheme
- pensionBalance: Current pension balance (number only)
- employerContribution: Employer contribution amount (number only)

Retirement Information:
- plannedRetirementAge: Planned retirement age (number only)
- retirementLifestyle: Modest/Comfortable/Luxurious
- monthlyRetirementExpense: Expected monthly expenses in retirement (number only)
- legacyGoal: Amount to leave as inheritance (number only)

Risk Tolerance Analysis:
- fixedDepositAmount: Amount in fixed deposits (number only)
- mutualFundAmount: Amount in mutual funds (number only)
- stockInvestmentAmount: Amount in stock investments (number only)
- risk_category: Low/Medium/High
- stock_holdings_value: Value of stock holdings (number only)
- mf_holdings_value: Value of mutual fund holdings (number only)
- total_portfolio_value: Total portfolio value (number only)

Health & Life Expectancy Information:
- height: Height in cm (number only)
- weight: Weight in kg (number only)
- bmi: BMI value (number only)
- physicalActivity: High/Moderate/Low
- smokingStatus: Never/Former/Current
- alcoholConsumption: Never/Frequent/Occasional
- diet: Balanced/Healthy/Poor
- bloodPressure: Low/Medium/High
- cholesterol: Cholesterol level (number only)
- asthma: 0 for No, 1 for Yes
- diabetes: 0 for No, 1 for Yes
- heartDisease: 0 for No, 1 for Yes
- hypertension: 0 for No, 1 for Yes

Instructions:
1. Only extract information that is explicitly mentioned or can be clearly inferred from the document
2. Do not make assumptions or guess values
3. For numerical fields, extract only the number without units
4. For boolean health conditions, use 0 for No/False and 1 for Yes/True
5. If a field is not found, do not include it in the response
6. Return the result as a valid JSON object

Response format:
{{
  "field_name": "extracted_value",
  ...
}}
"""
