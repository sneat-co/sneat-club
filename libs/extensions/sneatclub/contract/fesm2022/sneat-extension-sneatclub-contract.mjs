import { InjectionToken } from '@angular/core';

var ListPage;
(function (ListPage) {
    ListPage["list"] = "list";
})(ListPage || (ListPage = {}));

class ListItemInfoModel {
    static trackBy = (index, item) => !item
        ? index
        : (!!item.id && `id:${item.id}`) ||
            (item.subListId && `subList:${item.subListId}`) ||
            item.title;
}
class ListItemModel {
    static equalListItems(...items) {
        const { id, title, subListId, category, subListType } = items[0];
        return !items.some((item) => {
            if (id) {
                return item.id !== id;
            }
            return ((!!title && item.title !== title) ||
                (!!subListId && item.subListId !== subListId) ||
                (!!category && item.category !== category) ||
                (!!subListType && item.subListType !== subListType));
        });
    }
}
function getListShortUrlId(communeId, shortId, id) {
    if (shortId) {
        return `${communeId}-${shortId}`;
    }
    if (id) {
        return id;
    }
    return undefined;
}
function isListInfoMatchesListDto(i, l) {
    return ((!!i.id && i.id === l.id) ||
        (i.type === l.dbo?.type && !!i.shortId && i.shortId === l.dbo?.shortId));
}
function createListInfoFromDto(dto, shortId) {
    if (!dto.title) {
        throw new Error('!title');
    }
    const listInfo = {
        type: dto.type,
        title: dto.title,
    };
    if (shortId) {
        listInfo.shortId = shortId;
    }
    if (dto.items && dto.items.length) {
        listInfo.itemsCount = dto.items.length;
    }
    if (dto.emoji) {
        listInfo.emoji = dto.emoji;
    }
    if (dto.restrictions) {
        listInfo.restrictions = dto.restrictions;
    }
    if (dto.commune) {
        listInfo.space = dto.commune;
    }
    return listInfo;
}
// export function createListItemInfoFromListInfo(listInfo: IListInfo): IListItemBrief {
// 	return {
// 		id: listInfo.id || '',
// 		title: listInfo.title || '',
// 		subListType: listInfo.type,
// 		subListId: listInfo.id || `${listInfo.team && listInfo.team.id}-${listInfo.shortId}`,
// 		emoji: listInfo.emoji,
// 		img: listInfo.img,
// 	};
// }
// export function createListItemInfo(listItem: IListItemDto): IListItemBrief {
// 	const v: IListItemBrief = {
// 		id: listItem.id,
// 		title: listItem.title,
// 	};
// 	if (listItem.emoji) {
// 		v.emoji = listItem.emoji;
// 	}
// 	if (listItem.done) {
// 		v.done = true;
// 	}
// 	return v;
// }

const SNEATCLUB_SERVICE = new InjectionToken('SneatclubService');

/**
 * Generated bundle index. Do not edit.
 */

export { ListItemInfoModel, ListItemModel, ListPage, SNEATCLUB_SERVICE, createListInfoFromDto, getListShortUrlId, isListInfoMatchesListDto };
//# sourceMappingURL=sneat-extension-sneatclub-contract.mjs.map
