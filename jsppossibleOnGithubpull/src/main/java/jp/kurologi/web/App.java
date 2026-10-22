package jp.kurologi.web;

import java.time.LocalDateTime;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

import jp.kurologi.model.Address;
import jp.kurologi.model.Charge;
import jp.kurologi.model.Grade;
import jp.kurologi.model.Member;
import jp.kurologi.model.UsageStats;
import jp.kurologi.repository.InMemoryAddressRepository;
import jp.kurologi.repository.InMemoryMemberRepository;
import jp.kurologi.repository.InMemoryPaymentRepository;
import jp.kurologi.repository.MemberRepository;
import jp.kurologi.service.AccountService;
import jp.kurologi.service.AddressService;
import jp.kurologi.service.PasswordHasher;
import jp.kurologi.service.PaymentService;

/**
 * 저장소 · 서비스 조립. Spring 을 쓰지 않으므로 여기서 직접 new 합니다.
 * DB 를 붙일 때는 InMemory* 대신 JDBC/MyBatis 구현을 넣으면 됩니다.
 */
@WebListener
public class App implements ServletContextListener {

    private static final String KEY = App.class.getName();

    public final MemberRepository members;
    public final AccountService accounts;
    public final PaymentService payments;
    public final AddressService addresses;

    public App() {
        var memberRepo = new InMemoryMemberRepository();
        var paymentRepo = new InMemoryPaymentRepository();
        var addressRepo = new InMemoryAddressRepository();
        this.members = memberRepo;
        this.accounts = new AccountService(memberRepo, paymentRepo);
        this.payments = new PaymentService(memberRepo, paymentRepo);
        this.addresses = new AddressService(addressRepo);
        seedDemo(memberRepo, paymentRepo, addressRepo);
    }

    public static App of(ServletContext ctx) {
        return (App) ctx.getAttribute(KEY);
    }

    @Override
    public void contextInitialized(ServletContextEvent e) {
        e.getServletContext().setAttribute(KEY, this);
    }

    /** 데모 회원 user_id / demo1234 — 화면 확인용. 운영에서는 지우세요. */
    private static void seedDemo(InMemoryMemberRepository members, InMemoryPaymentRepository payments,
                                 InMemoryAddressRepository addresses) {
        Member m = new Member();
        m.setId(1);
        m.setLoginId("user_id");
        m.setPasswordHash(PasswordHasher.hash("demo1234"));
        m.setMailboxNo("KR0000001");
        m.setMemberNo("KR000000001");
        m.setName("홍길동");
        m.setEnglishName("HONG GILDONG");
        m.setPhone("010-0000-0000");
        m.setEmail("user@example.com");
        m.setGrade(Grade.BASIC);
        m.setDeposit(5_000);
        m.setReferralCode("HGD2026");
        m.setLastLoginAt(LocalDateTime.now().minusDays(1));
        members.save(m);
        members.putUsageStats(1, new UsageStats(12, 7, 58));

        Charge c1 = new Charge();
        c1.setMemberId(1);
        c1.setTitle("배송비 - 항공 도쿄 (주문 KR2610-0012)");
        c1.setOrderNo("KR2610-0012");
        c1.setAmount(3_280);
        c1.setCreatedAt(LocalDateTime.now().minusDays(2));
        payments.saveCharge(c1);

        Charge c2 = new Charge();
        c2.setMemberId(1);
        c2.setTitle("보관료 - 31일 초과 (주문 KR2609-0087)");
        c2.setOrderNo("KR2609-0087");
        c2.setAmount(600);
        c2.setCreatedAt(LocalDateTime.now().minusDays(1));
        payments.saveCharge(c2);

        Address a = new Address();
        a.setMemberId(1);
        a.setName("홍길동");
        a.setZipcode("00000");
        a.setAddress1("서울특별시 예시구 예시로 00");
        a.setAddress2("(예시동, 예시아파트)");
        a.setPhone("010-0000-0000");
        a.setCustomsCode("P000000000000");
        addresses.save(a);
    }
}
