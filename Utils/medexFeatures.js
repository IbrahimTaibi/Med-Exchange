class MedexFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    const excludedArray = ["sort", "page", "limit", "fields", "search"];
    const shallowCopy = { ...this.queryStr };
    excludedArray.forEach((el) => {
      delete shallowCopy[el];
    });

    let queryString = JSON.stringify(shallowCopy);
    queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, (match) => {
      return `$${match}`;
    });

    const queryObj = JSON.parse(queryString);
    this.query = this.query.find(queryObj);
    return this;
  }

  search() {
    if (this.queryStr.search) {
      const searchTerm = this.queryStr.search;
      this.query = this.query.find({
        name: { $regex: searchTerm, $options: "i" }, // Case-insensitive and partial match
      });
    }
    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      let sortBy = this.queryStr.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  fields() {
    if (this.queryStr.fields) {
      let fields = this.queryStr.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  paginate() {
    const page = this.queryStr.page * 1 || 1;
    const limit = this.queryStr.limit * 1 || 50;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = MedexFeatures;
