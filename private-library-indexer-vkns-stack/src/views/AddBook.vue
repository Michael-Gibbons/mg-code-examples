<template>
  <div class="">
    <form action="/api/v1/books" method="POST" class="bg-gray-200 p-2 w-1/3 m-auto rounded mt-4">
      <div class="p-1">
        <label for="title" class="mr-2">Title</label>
        <input type="text" name="title" class="rounded">
      </div>
      <div class="p-1">
        <label for="isbm" class="mr-2">ISBN</label>
        <input type="text" name="isbn" class="rounded">
      </div>
      <div class="p-1">
        <label for="genre" class="mr-2">Genre</label>
        <input type="text" name="genre" class="rounded">
      </div>
      <div class="p-1">
        <label for="synopsis" class="mr-2">Synopsis</label>
        <input type="text" name="synopsis" class="rounded">
      </div>
      <div class="p-1">
        <label for="pages" class="mr-2">Pages</label>
        <input type="text" name="pages" class="rounded">
      </div>
      <div class="p-1">
        <label for="seriesName" class="mr-2">Series Name</label>
        <input type="text" name="seriesName" class="rounded">
      </div>
      <div class="p-1">
        <label for="authorName" class="mr-2">Author Name</label>
        <input type="text" name="authorName" class="rounded">
      </div>
      <div class="p-1">
        <label for="authorBio" class="mr-2">Author Biography</label>
        <input type="text" name="authorBio" class="rounded">
      </div>
      <div class="p-1">
        <button type="submit">Submit</button>
      </div>
    </form>
  </div>
</template>

<script>

</script>
