package jp.kurologi.model;

import java.util.List;
/**ㄴㄷㄹㄴㅇㄹㄴ수정6*/
/** 일본 사서함(센터) 주소 — 회원 공통, 사서함번호·수취인만 회원마다 다릅니다. */
public record MailboxCenter(String name, String zipcode, String address, String phone) {

    public static final List<MailboxCenter> ALL = List.of(
            new MailboxCenter("항공 - 도쿄(JP)", "187-0011", "東京都小平市鈴木町1-466-19-3F", "042-401-0754"),
            new MailboxCenter("해상 - 후쿠오카 제1센터(JP)", "812-0876", "福岡県 福岡市 博多区 昭南町 2-3-8-3F", "070-9293-9189"),
            new MailboxCenter("해상 - 후쿠오카 제2센터(JP)", "811-2304", "福岡県糟屋郡粕屋町仲原２７７４−６ KURO", "070-9285-4145"));

    public String getName() { return name; }
    public String getZipcode() { return zipcode; }
    public String getAddress() { return address; }
    public String getPhone() { return phone; }
}
