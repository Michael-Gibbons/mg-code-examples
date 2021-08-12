module.exports = (sequelize, DataTypes) => {
  const Books = sequelize.define("Books",{
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    isbn: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    genre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    synopsis: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    pages: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    seriesName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    authorName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    authorBio: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    }
  });

  Books.addHook('beforeCreate', (book) => {
    book.title = book.title.toLowerCase();
    book.genre = book.genre.toLowerCase();
    book.synopsis = book.synopsis.toLowerCase();
    book.seriesName = book.seriesName.toLowerCase();
    book.authorName = book.authorName.toLowerCase();
    book.authorBio = book.authorBio.toLowerCase();

    return book;
  });

  return Books;
}