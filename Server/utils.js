module.exports.between = (lowerBound, upperBound, value) => {
    return ((value >= lowerBound) && (value <= upperBound));
}