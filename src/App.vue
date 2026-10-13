<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import AppSidebar from "@/components/layout/AppSidebar.vue";
import AppTopbar from "@/components/layout/AppTopbar.vue";
import CommandPalette from "@/components/layout/CommandPalette.vue";
import ToastHost from "@/components/ui/ToastHost.vue";

const route = useRoute();
const sidebarOpen = ref(false);
const paletteOpen = ref(false);

watch(() => route.fullPath, () => (sidebarOpen.value = false));

function onKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    paletteOpen.value = !paletteOpen.value;
  }
}

onMounted(() => window.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown));
</script>

<template>
  <div class="min-h-dvh lg:pl-64">
    <AppSidebar :open="sidebarOpen" @close="sidebarOpen = false" />
    <div class="flex min-h-dvh flex-col">
      <AppTopbar @menu="sidebarOpen = true" @search="paletteOpen = true" />
      <main class="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <RouterView v-slot="{ Component }">
          <Transition
            mode="out-in"
            enter-from-class="opacity-0 translate-y-1"
            enter-active-class="transition duration-200 ease-out"
            leave-active-class="transition duration-100 ease-in"
            leave-to-class="opacity-0"
          >
            <KeepAlive :max="6">
              <component :is="Component" />
            </KeepAlive>
          </Transition>
        </RouterView>
      </main>
    </div>
    <CommandPalette v-model:open="paletteOpen" />
    <ToastHost />
  </div>
</template>
