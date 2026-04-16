export const pagination = async ({
  page = 1,
  limit = 5,
  model,
  populate = [],
  filter = {},
  sort = {},
  select = null,
} = {}) => {
  const _page = Math.max(parseInt(page), 1);
  const _limit = Math.max(parseInt(limit), 1);
  const skip = (_page - 1) * _limit;

  const totalCount = await model.countDocuments(filter);

  let query = model.find(filter).limit(_limit).skip(skip).sort(sort);
  if (select) {
    query = query.select(select);
  }

  if (populate) {
    const populateArr = Array.isArray(populate) ? populate : [populate];
    populateArr.forEach((pop) => {
      query = query.populate(pop);
    });
  }
  const data = await query;

  return {
    data,
    page: _page,
    limit: _limit,
    totalCount,
    totalPages: Math.ceil(totalCount / _limit),
  };
};
