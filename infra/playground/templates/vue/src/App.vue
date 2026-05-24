<script setup lang="ts">
import { defineComponent } from "vue";

const TaskCard = defineComponent({
	props: {
		title: { type: String, required: true },
		status: { type: String, required: true },
	},
	template: `
    <article>
      <h3>{{ title }}</h3>
      <span>{{ status }}</span>
    </article>
  `,
});

const TaskBoard = defineComponent({
	components: { TaskCard },
	template: `
    <section>
      <h1>Task Board</h1>
      <TaskCard title="Setup project" status="Todo" />
      <TaskCard title="Build UI" status="In Progress" />
      <TaskCard title="Write tests" status="Done" />
    </section>
  `,
});
</script>

<template>
  <TaskBoard />
</template>
