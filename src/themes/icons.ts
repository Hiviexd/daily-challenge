// fontawesome icons
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import {
    faSignOutAlt,
    faUserCircle,
    faEye,
    faEyeSlash,
    faPollH,
    faPlus,
    faCalendar,
    faUser,
    faComment,
    faSearch,
    faCheckCircle,
    faTimesCircle,
    faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";

export default function loadIcons() {
    library.add(
        fab,
        faSignOutAlt,
        faUserCircle,
        faEye,
        faEyeSlash,
        faPollH,
        faPlus,
        faCalendar,
        faUser,
        faComment,
        faSearch,
        faCheckCircle,
        faTimesCircle,
        faExclamationTriangle
    );
}
