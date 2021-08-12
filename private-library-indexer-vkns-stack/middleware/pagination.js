module.exports = {
  pagination(){
    return async (ctx, next) => {
      const MAX_LIMIT = 100;
      const DEFAULT_LIMIT = 20;

      let page = ctx.request.query.page;
      let limit = ctx.request.query.limit;

      if(limit > MAX_LIMIT){
        ctx.status = 400;
        ctx.response.body = {error: {message: `A maximum of ${MAX_LIMIT} records per request is allowed.` }};
        return;
      }

      if(!page || page < 0 || isNaN(page)){
        page = 1;
      }

      if(!limit || isNaN(limit)){
        limit = DEFAULT_LIMIT;
      }

      const offset = (page == 1) ? 0 : limit*(page - 1);
      ctx.state.limit = limit;
      ctx.state.offset = offset;

      await next()
    }
  }
}