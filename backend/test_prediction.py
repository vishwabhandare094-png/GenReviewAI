from app.ml.predictor import predict_sentiment

review = "The food was amazing and the staff was very friendly."

result = predict_sentiment(review)

print(result)