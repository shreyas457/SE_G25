from dspy import Signature, Predict, MIPROv2, InputField, OutputField, configure, LM
from dspy.evaluate.metrics import answer_exact_match

# configure(lm=LM("openai/gpt-4o-mini"))
# configure(lm=LM("openrouter/deepseek-r1"))

class ClassifySupportMessage(Signature):
    message: str = InputField(desc="Customer support message text")
    category: str = OutputField(desc="Predicted category (Billing, Technical Issue, Shipping, Account)")

model = Predict(ClassifySupportMessage)

trainset = [
    ClassifySupportMessage(message="I want to update my credit card details", category="Billing"),
    ClassifySupportMessage(message="App crashes every time I log in", category="Technical Issue"),
    ClassifySupportMessage(message="My order never arrived", category="Shipping"),
    ClassifySupportMessage(message="Please delete my account permanently", category="Account"),
]


mipro = MIPROv2(metric=answer_exact_match, auto="light")
optimized_model = mipro.compile(model, trainset=trainset)


testset = [
    ClassifySupportMessage(message="I canceled last week but was still charged", category="Billing"),
    ClassifySupportMessage(message="The app doesn't load on my phone", category="Technical Issue"),
    ClassifySupportMessage(message="My package arrived late and damaged", category="Shipping"),
    ClassifySupportMessage(message="How do I deactivate my profile?", category="Account"),
]


correct = 0
for example in testset:
    pred = optimized_model.predict(message=example.message)
    if pred.category.lower() == example.category.lower():
        correct += 1

accuracy = correct / len(testset)
print(f"Accuracy: {accuracy:.2f}")
