const KoaRouter = require('koa-router');
const router = new KoaRouter({ prefix: '/api/v1' });

const { Books } = require('../../../../models');

const { pagination } = require('../../../../middleware/pagination');

const { getDefinedSubset, queryFormat, getAllowedQueryParameters } = require('../../../../util/helpers');

//get book
router.get('/books/:isbn', async ctx => {
  try{
    const book = await Books.findOne({ where: { isbn: ctx.params.isbn } });
    if (book === null) {
      ctx.status = 404;
      ctx.response.body = {error: {message: `No book in database with ISBN: ${ctx.params.isbn}` }};
      return;
    }

    ctx.status = 200;
    ctx.response.body = book;

  }catch(err){
    ctx.app.emit('error', err, ctx);
  }
});

//get book collection
router.get('/books', pagination(), async ctx => {
  try{
    const ALLOWED_QUERY_PARAMETERS = getAllowedQueryParameters(Books);
    const query = queryFormat(getDefinedSubset(ALLOWED_QUERY_PARAMETERS, ctx.request.query));

    const books = await Books.findAndCountAll({
      where: query,
      order: ['title'],
      limit: ctx.state.limit,
      offset: ctx.state.offset,
    })

    ctx.response.body = {books: books};

  }catch(err){
    ctx.app.emit('error', err, ctx);
  }
});

//add book
router.post('/books', async ctx => {
  try{
    const ALLOWED_QUERY_PARAMETERS = getAllowedQueryParameters(Books);
    const BookToAdd = getDefinedSubset(ALLOWED_QUERY_PARAMETERS, ctx.request.body);
    //todo form validation

    const [book, created] = await Books.findOrCreate({
      where: { isbn: BookToAdd.isbn },
      defaults: BookToAdd
    });

    if(created){
      ctx.status = 201;
      ctx.response.body = book;
      return;
    }

    ctx.status = 409;
    ctx.response.body = {error: {message: 'duplicate ISBN found.' }};

  }catch(err){
    ctx.app.emit('error', err, ctx);
  }
});

//replace a book's data
router.patch('/books/:isbn', async ctx => {
  try{
    const ALLOWED_QUERY_PARAMETERS = getAllowedQueryParameters(Books);
    const updates = queryFormat(getDefinedSubset(ALLOWED_QUERY_PARAMETERS, ctx.request.query));

    const updatedBook = await Books.update(
      updates,
      { where: { isbn: ctx.params.isbn } }
    )

    if(updatedBook){
      const book = await Books.findOne({where: { isbn: ctx.params.isbn }});
      ctx.status = 200;
      ctx.response.body = book;
      return
    }

    ctx.status = 404;
    ctx.response.body = {error: {message: `No book in database with ISBN: ${ctx.params.isbn}` }};

  }catch(err){
    ctx.app.emit('error', err, ctx);
  }
});

//delete book
router.delete('/books/:isbn', async ctx =>{
  try{
    const deleted = await Books.destroy({where: {isbn: ctx.params.isbn}});
    if(deleted){
      ctx.status = 200;
      ctx.response.body = {message: 'Book Deleted Successfully'};
      return
    }

    ctx.status = 404;
    ctx.response.body = {error: {message: `No book in database with ISBN: ${ctx.params.isbn}` }};

  }catch(err){
    ctx.app.emit('error', err, ctx);
  }
});


module.exports = router