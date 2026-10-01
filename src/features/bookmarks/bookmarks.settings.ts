import { configService } from "../../core/config/config.service";
import { createElement } from "../../shared/dom/dom";
import { bookmarksService } from "./bookmarks.service";

export function createBookmarksSettings(): HTMLElement {
  const wrapper = createElement("div", { id: "bookmarks-options" });

  // 1. Toggle ON / OFF
  const toggleContainer = createElement("div", { className: "container" });
  const toggleLabel = createElement("label", {
    htmlFor: "bookmarks-visibility-toggle",
    textContent: "Show Bookmarks",
  });

  const switchWrapper = createElement("label", { className: "switch" });
  const toggleInput = createElement("input", {
    id: "bookmarks-visibility-toggle",
    type: "checkbox",
  });
  toggleInput.checked = configService.getShowBookmarks();

  const switchSlider = createElement("span", { className: "switch-slider" });
  switchWrapper.append(toggleInput, switchSlider);

  toggleInput.addEventListener("change", () => {
    configService.setShowBookmarks(toggleInput.checked);
  });
  toggleContainer.append(toggleLabel, switchWrapper);

  // 2. Columns Selector
  const columnsContainer = createElement("div", { className: "container" });
  const columnsLabel = createElement("label", {
    htmlFor: "bookmarks-columns-selector",
    textContent: "Grid Columns",
  });

  const columnsSelect = createElement("select", {
    id: "bookmarks-columns-selector",
    className: "settings-select",
  });

  const currentColumns = configService.getBookmarkColumns();
  for (let c = 2; c <= 6; c++) {
    const opt = createElement("option", {
      value: String(c),
      textContent: `${c} Columns`,
    });
    if (c === currentColumns) {
      opt.selected = true;
    }
    columnsSelect.appendChild(opt);
  }

  columnsSelect.addEventListener("change", () => {
    configService.setBookmarkColumns(parseInt(columnsSelect.value, 10));
  });
  columnsContainer.append(columnsLabel, columnsSelect);

  // 3. Add Bookmark Form
  const addFormContainer = createElement("div", { className: "bookmark-form-card" });
  const addFormTitle = createElement("span", {
    className: "settings-section-title",
    textContent: "Add Bookmark",
  });

  const formFields = createElement("div", { className: "bookmark-form-fields" });
  const titleInput = createElement("input", {
    className: "settings-text-input",
    type: "text",
    placeholder: "Name (e.g. GitHub)",
    autocomplete: "off",
  });

  const urlInput = createElement("input", {
    className: "settings-text-input",
    type: "url",
    placeholder: "URL (e.g. https://github.com)",
    autocomplete: "off",
  });

  const addButton = createElement("button", {
    className: "settings-action-btn",
    type: "button",
    textContent: "Add Bookmark",
  });

  formFields.append(titleInput, urlInput, addButton);
  addFormContainer.append(addFormTitle, formFields);

  // 4. Current Bookmarks List
  const listContainer = createElement("div", { className: "bookmarks-list-card" });
  const listTitle = createElement("span", {
    className: "settings-section-title",
    textContent: "Manage Bookmarks",
  });
  const listItemsWrapper = createElement("div", { className: "bookmarks-items-wrapper" });

  const renderList = () => {
    listItemsWrapper.innerHTML = "";
    const bookmarks = configService.getBookmarks();

    if (bookmarks.length === 0) {
      const emptyNotice = createElement("div", {
        className: "bookmarks-empty-notice",
        textContent: "No bookmarks added yet.",
      });
      listItemsWrapper.appendChild(emptyNotice);
      return;
    }

    bookmarks.forEach((item) => {
      const row = createElement("div", { className: "bookmark-item-row" });

      const infoWrapper = createElement("div", { className: "bookmark-item-info" });
      const faviconUrl = bookmarksService.getFaviconUrl(item.url);

      const faviconImg = createElement("img", {
        className: "bookmark-item-icon",
        src: faviconUrl,
        alt: item.title,
        loading: "lazy",
      });
      faviconImg.onerror = () => {
        faviconImg.style.display = "none";
      };

      const titleSpan = createElement("span", {
        className: "bookmark-item-title",
        textContent: item.title,
      });

      const urlSpan = createElement("span", {
        className: "bookmark-item-url",
        textContent: bookmarksService.getDisplayDomain(item.url),
      });

      infoWrapper.append(faviconImg, titleSpan, urlSpan);

      const deleteBtn = createElement("button", {
        className: "bookmark-delete-btn",
        title: "Delete Bookmark",
        textContent: "Remove",
      });

      deleteBtn.addEventListener("click", async () => {
        await configService.removeBookmark(item.id);
        renderList();
      });

      row.append(infoWrapper, deleteBtn);
      listItemsWrapper.appendChild(row);
    });
  };

  const handleAdd = async () => {
    const rawUrl = urlInput.value.trim();
    if (!rawUrl) return;

    const title = titleInput.value.trim();
    await configService.addBookmark(title, rawUrl);
    titleInput.value = "";
    urlInput.value = "";
    renderList();
  };

  addButton.addEventListener("click", handleAdd);
  urlInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleAdd();
  });

  listContainer.append(listTitle, listItemsWrapper);
  renderList();

  wrapper.append(toggleContainer, columnsContainer, addFormContainer, listContainer);
  return wrapper;
}
