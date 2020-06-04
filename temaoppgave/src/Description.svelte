<script>
   import { createEventDispatcher, onDestroy } from 'svelte'
   import { fade } from 'svelte/transition';

   const dispatch = createEventDispatcher()
   const close = () => dispatch('close')

   let description

   const handle_keydown = e => {
       if (e.key === 'Escape') {
           close()
           return
       }
       if (e.key === 'Tab') {
           const nodes = description.querySelectorAll('*')
           const tabbable = Array.from(nodes).filter(n => n.tabIndex >= 0)

           let index = tabbable.indexOf(document.activeElement)
           if (index === -1 && e.shiftKey) index = 0 

           index += tabbable.length + (e.shiftKey ? -1 : 1)
           index %= tabbable.length

           tabbable[index].focus()
           e.preventDefault()
       }
    }

       const previously_focused = typeof document !== 'undefined' && document.activeElement

       if (previously_focused) {
           onDestroy(() => {
               previously_focused.focus()
           })
       }
</script>

<svelte:window on:keydown={handle_keydown}/> 

<div class="description" role="dialog" aria-modal="true" bind:this={description} on:click={close} transition:fade>
    <slot name="x"></slot>
    <slot name="list"></slot>
    <button on:click={close}>CLOSE</button>
</div>

<style>
    .description {
        position: fixed;
        background-color: #C14C3B;
        border-radius: 100px 1px 100px 1px;
        color: #E6E7D4;
        letter-spacing: .1rem;
        line-height: 2rem;
        width: 70vw;
		min-height: 68vh;
        top: 25vh;
		left: 0;
		padding: 4rem;
		margin: 2rem;
        display: grid;
        place-items: center;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        z-index: 20;
    }

    button {
        display: block;
        padding: 1rem;
		margin-top: 1.2rem;
        outline: none;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        border-radius: 100px;
		width: 148px;
		background-color: #E6E7D4;
		color: #C14C3B;
		font-weight: bold;
		border: none;
		transition: ease 0.2s;
    }

    button:hover {
		transform: scale(1.05);
	}
</style>