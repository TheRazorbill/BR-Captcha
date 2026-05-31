import { SFX, el, makeGridCaptcha, shakeWrong } from '../../shared.js';

export function renderConserteChinelo(parent, onComplete) {
  const { content, refreshImg, verifyBtn } = makeGridCaptcha(
    'Como você concertaria esse chinelo?',
    'Arraste o item',
    parent
  );

  const BROKEN_IMG = 'assets/conserte-chinelo/chinelo-arrebentado.png';
  const FIXED_IMG = 'assets/conserte-chinelo/chinelo-com-prego.png';

  const items = [
    {
      id: 'prego',
      label: 'Prego',
      src: 'assets/conserte-chinelo/prego.png',
      correct: true,
    },
    {
      id: 'fita',
      label: 'Fita crepe',
      src: 'assets/conserte-chinelo/fita-crepe.png',
      correct: false,
    },
    {
      id: 'cola',
      label: 'Cola',
      src: 'assets/conserte-chinelo/cola.png',
      correct: false,
    },
    {
      id: 'martelo',
      label: 'Martelo',
      src: 'assets/conserte-chinelo/martelo.png',
      correct: false,
    },
  ];

  let fixed = false;
  let selectedItem = null;
  let draggingItem = null;
  let offsetX = 0;
  let offsetY = 0;

  let chineloArea = null;
  let chineloImg = null;
  let itemsArea = null;
  let status = null;

  verifyBtn.disabled = true;

  function renderGame() {
    fixed = false;
    selectedItem = null;
    draggingItem = null;
    verifyBtn.disabled = true;

    content.innerHTML = '';

    const gameArea = el('div', 'chinelo-game-area');

    chineloArea = el('div', 'chinelo-drop-area');

    chineloImg = el('img', 'chinelo-img', {
      src: BROKEN_IMG,
      alt: 'Chinelo arrebentado',
    });

    const dropHint = el('div', 'chinelo-drop-hint');

    chineloArea.appendChild(chineloImg);
    chineloArea.appendChild(dropHint);

    itemsArea = el('div', 'chinelo-items-area');

    items.forEach(item => {
      const itemCard = el('div', 'chinelo-item-card');
      itemCard.dataset.itemId = item.id;

      const itemImg = el('img', 'chinelo-tool-img', {
        src: item.src,
        alt: item.label,
      });

      const itemLabel = el('span', 'chinelo-tool-label');
      itemLabel.textContent = item.label;

      itemCard.appendChild(itemImg);
      itemCard.appendChild(itemLabel);
      itemsArea.appendChild(itemCard);

      itemCard.addEventListener('pointerdown', event => {
        if (fixed) return;

        SFX.click();

        selectedItem = item;
        draggingItem = itemCard;

        const rect = itemCard.getBoundingClientRect();

        offsetX = event.clientX - rect.left;
        offsetY = event.clientY - rect.top;

        itemCard.classList.add('dragging');
        itemCard.style.position = 'fixed';
        itemCard.style.left = `${rect.left}px`;
        itemCard.style.top = `${rect.top}px`;
        itemCard.style.zIndex = '9999';
        itemCard.style.pointerEvents = 'none';

        document.body.appendChild(itemCard);
      });
    });

    status = el('div', 'chinelo-status');

    gameArea.appendChild(chineloArea);
    gameArea.appendChild(itemsArea);

    content.appendChild(gameArea);
    content.appendChild(status);
  }

  function isInsideDropArea(x, y) {
    const rect = chineloArea.getBoundingClientRect();

    return (
      x >= rect.left &&
      x <= rect.right &&
      y >= rect.top &&
      y <= rect.bottom
    );
  }

  function resetItemPosition(itemElement) {
    itemElement.style.position = '';
    itemElement.style.left = '';
    itemElement.style.top = '';
    itemElement.style.zIndex = '';
    itemElement.style.pointerEvents = '';
    itemElement.classList.remove('dragging');
  }

  function fixChinelo() {
    fixed = true;
    verifyBtn.disabled = false;

    chineloImg.src = FIXED_IMG;
    chineloArea.classList.add('fixed');
    status.textContent = 'Chinelo salvo com a arte da gambiarra.';

    SFX.correct();
  }

  function wrongItem(itemElement, label) {
    SFX.wrong();

    status.textContent = `${label} não resolve. Isso aqui exige gambiarra raiz.`;

    itemElement.classList.add('wrong');

    setTimeout(() => {
      itemElement.classList.remove('wrong');
    }, 900);
  }

  function handlePointerMove(event) {
    if (!draggingItem) return;

    draggingItem.style.left = `${event.clientX - offsetX}px`;
    draggingItem.style.top = `${event.clientY - offsetY}px`;

    if (isInsideDropArea(event.clientX, event.clientY)) {
      chineloArea.classList.add('hovering');
    } else {
      chineloArea.classList.remove('hovering');
    }
  }

  function handlePointerUp(event) {
    if (!draggingItem || !selectedItem) return;

    chineloArea.classList.remove('hovering');

    const droppedInside = isInsideDropArea(event.clientX, event.clientY);

    const currentDraggingItem = draggingItem;
    const currentSelectedItem = selectedItem;

    draggingItem = null;
    selectedItem = null;

    if (droppedInside && currentSelectedItem.correct) {
      currentDraggingItem.remove();
      fixChinelo();
      return;
    }

    if (droppedInside && !currentSelectedItem.correct) {
      wrongItem(currentDraggingItem, currentSelectedItem.label);
    }

    resetItemPosition(currentDraggingItem);
    itemsArea.appendChild(currentDraggingItem);
  }

  window.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerup', handlePointerUp);

  refreshImg.addEventListener('click', () => {
    SFX.refresh();
    refreshImg.classList.add('spinning');
    setTimeout(() => refreshImg.classList.remove('spinning'), 500);
    renderGame();
  });

  verifyBtn.addEventListener('click', () => {
    if (fixed) {
      SFX.correct();
      onComplete();
    } else {
      SFX.wrong();
      shakeWrong(verifyBtn);
    }
  });

  renderGame();

  return () => {
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  };
}