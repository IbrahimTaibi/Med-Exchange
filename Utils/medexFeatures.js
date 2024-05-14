class MedexFeatures {
  constructor(query, queryStr, count) {
    this.query = query;
    this.queryStr = queryStr;
    this.counter = count;
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
  sort() {
    if (this.queryStr.sort) {
      let sortBy = this.queryStr.sort.split(",").join(" ");
      // console.log(sortBy);
      this.query = this.query.sort(sortBy);
      return this;
    } else {
      this.query = query.sort("createdAt");
      return this;
    }
  }
  fields() {
    if (this.queryStr.fields) {
      let fields = this.queryStr.fields.split(",").join(" ");
      this.query = this.query.select(fields);
      // console.log(this);
      return this;
    } else {
      this.query = this.query.select("-__v");
      return this;
    }
  }
  pagination() {
    const page = this.queryStr.page * 1 || 1;
    const limit = this.queryStr.limit * 1 || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    // const medicationCount = async (axx) => {
    //   return await axx;
    // };
    // const counting = medicationCount(this.counter);
    // counting.then((count) => {
    //   if (this.queryStr.page) {
    //     console.log(count);
    //     if (count <= skip) {
    //       throw new Error("Page not found");
    //     }
    //   }
    // })  ;
    return this;
  }
}

module.exports = MedexFeatures;
