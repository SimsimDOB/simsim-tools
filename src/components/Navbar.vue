<script setup lang="ts"></script>

<template>
  <nav class="bg-[#3b4252] shadow-md border-b border-[#4c566a]">
    <div class="w-full px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <div class="flex-shrink-0 flex items-center">
            <img
              class="h-8 w-auto"
              src="/simsim_logo.png"
              alt="Simsim Tools Logo"
            />
            <!-- <span class="ml-3 text-xl font-bold text-[#88c0d0]"
              >Simsim Tools</span
            > -->
          </div>
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <router-link
              to="/summonses-counter"
              class="border-transparent text-[#d8dee9] hover:border-[#88c0d0] hover:text-[#88c0d0] inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200"
              active-class="border-[#88c0d0] text-[#88c0d0]"
            >
              Summonses Counter
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
