from dspy import Signature, Predict, MIPROv2
from dspy.evaluate.metrics import answer_exact_match

class ClassifySupportMessage(Signature):
    message = str
    category = str  # Billing, Technical Issue, Shipping, Account

class SupportClassifier(Predict):
    signature = ClassifySupportMessage

model = SupportClassifier()

trainset = [
    {"message": "I want to update my credit card details", "category": "Billing"},
    {"message": "App crashes every time I log in", "category": "Technical Issue"},
    {"message": "My order never arrived", "category": "Shipping"},
    {"message": "Please delete my account permanently", "category": "Account"},
]

mipro = MIPROv2(metric=answer_exact_match(), max_iters=10)
optimized_model = mipro(model, trainset)

testset = [
    {"message": "I canceled last week but was still charged", "category": "Billing"},
    {"message": "The app doesn't load on my phone", "category": "Technical Issue"},
    {"message": "My package arrived late and damaged", "category": "Shipping"},
    {"message": "How do I deactivate my profile?", "category": "Account"},
]

correct = 0
for example in testset:
    pred = optimized_model.predict(message=example["message"])
    if pred.category.lower() == example["category"].lower():
        correct += 1

accuracy = correct / len(testset)
print(f"Accuracy: {accuracy:.2f}")
