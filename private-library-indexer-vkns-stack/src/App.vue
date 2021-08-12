<template>
  <div id="nav">
    <router-link to="/">Home</router-link> |
    <router-link to="/about">
    <font-awesome-icon icon="trash-alt" class="text-red-700"/>
    About
    </router-link> |
    <router-link to="/add">Add</router-link>
  </div>  
  <router-view/>
</template>

<style src="./assets/css/tailwind.css"/>

