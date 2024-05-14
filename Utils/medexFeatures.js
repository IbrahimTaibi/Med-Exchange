class MedexFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }
  filter() {
    const excludedArray = ["sort", "page", "limit", "fields"];
    const shallowCopy = { ...this.queryStr };
    excludedArray.forEach((el) => {
      delete shallowCopy[el];
    });
    // console.log(shallowCopy);
    let queryString = JSON.stringify(shallowCopy);
    // console.log(queryStr);
    queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, (match) => {
      return `$${match}`;
    });
    // console.log(queryStr);
    const queryObj = JSON.parse(queryString);
    // console.log(queryObj);
    // Sorting the data using the original query in the request --

    this.query = this.query.find(queryObj);
    return this;
  }
}

module.exports = MedexFeatures;
