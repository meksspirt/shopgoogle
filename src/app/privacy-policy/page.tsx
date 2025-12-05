"use client";

export default function PrivacyPolicyPage() {
    return (
        <div className="privacy-policy-container">
            <div className="privacy-policy-wrapper">
                <h1 className="privacy-policy-title">ПОЛІТИКА КОНФІДЕНЦІЙНОСТІ ТА ЗАХИСТУ ПЕРСОНАЛЬНИХ ДАНИХ</h1>

                <div className="privacy-policy-content">
                    <p className="intro-text">
                        Ця Політика конфіденційності описує порядок збору, зберігання, використання та захисту інформації про користувачів сайту calmcraft.shop (далі — «Сайт»).
                    </p>
                    <p className="intro-text">
                        Адміністрація Сайту з повагою ставиться до конфіденційної інформації будь-якої особи, яка відвідує Сайт. Ми діємо відповідно до Закону України «Про захист персональних даних» та загальних регламентів захисту даних.
                    </p>

                    <section className="policy-section">
                        <h2>1. ЗБІР ПЕРСОНАЛЬНИХ ДАНИХ</h2>
                        <p>
                            <strong>1.1.</strong> Ми збираємо лише ту інформацію, яка необхідна для виконання наших зобов'язань перед вами та покращення сервісу.
                        </p>
                        <p>
                            <strong>1.2.</strong> Категорії даних, що збираються:
                        </p>
                        <ul>
                            <li>
                                <strong>Ідентифікаційні дані:</strong> ПІБ, номер телефону, адреса електронної пошти (e-mail). Ці дані ви надаєте добровільно при реєстрації, оформленні замовлення або підписці на розсилку.
                            </li>
                            <li>
                                <strong>Дані доставки:</strong> Місто та номер відділення служби доставки.
                            </li>
                            <li>
                                <strong>Технічні дані:</strong> IP-адреса, тип браузера, тип пристрою, файли Cookie, логи систем (збираються автоматично для аналітики та безпеки).
                            </li>
                            <li>
                                <strong>Історія замовлень:</strong> Інформація про придбані вами товари.
                            </li>
                        </ul>
                    </section>

                    <section className="policy-section">
                        <h2>2. ЦІЛІ ВИКОРИСТАННЯ ДАНИХ</h2>
                        <p>Ми використовуємо ваші дані для наступних цілей:</p>
                        <p>
                            <strong>2.1. Виконання замовлень:</strong> Обробка заявки, пакування, передача даних до служби логістики («Нова Пошта») для доставки, відправка чеків (ПРРО).
                        </p>
                        <p>
                            <strong>2.2. Комунікація:</strong> Повідомлення про статус замовлення, відповіді на ваші запити, надсилання сервісних повідомлень (наприклад, відновлення пароля).
                        </p>
                        <p>
                            <strong>2.3. Безпека та авторизація:</strong> Ми використовуємо сервіс Supabase для безпечної аутентифікації користувачів та захисту вашого акаунту.
                        </p>
                        <p>
                            <strong>2.4. Маркетинг (лише за згодою):</strong> Надсилання інформації про новинки та акції, якщо ви дали на це згоду. Ви можете відписатися від розсилки в будь-який момент.
                        </p>
                    </section>

                    <section className="policy-section">
                        <h2>3. ЗБЕРІГАННЯ ТА ПЕРЕДАЧА ДАНИХ ТРЕТІМ ОСОБАМ</h2>
                        <p>
                            <strong>3.1.</strong> Ми не продаємо та не здаємо в оренду ваші персональні дані.
                        </p>
                        <p>
                            <strong>3.2.</strong> Передача даних третім особам здійснюється лише в обсязі, необхідному для надання послуг:
                        </p>
                        <ul>
                            <li>
                                <strong>Логістичні партнери:</strong> Компанія ТОВ «Нова Пошта» отримує ваше ПІБ, телефон та місто для здійснення доставки.
                            </li>
                            <li>
                                <strong>Платіжні провайдери:</strong> Сервіси (Monobank, LiqPay, WayForPay) обробляють ваші платіжні дані. Ми не зберігаємо дані ваших банківських карток — транзакції відбуваються на захищеному боці банку.
                            </li>
                            <li>
                                <strong>Технічні провайдери:</strong> Хостинг-провайдери (Vercel) та бази даних (Supabase), які забезпечують роботу Сайту.
                            </li>
                        </ul>
                        <p>
                            <strong>3.3.</strong> Розкриття даних можливе у випадках, передбачених законодавством України (на запит правоохоронних органів).
                        </p>
                    </section>

                    <section className="policy-section">
                        <h2>4. ФАЙЛИ COOKIE</h2>
                        <p>
                            <strong>4.1.</strong> Сайт використовує файли cookie для покращення досвіду користувачів:
                        </p>
                        <ul>
                            <li>
                                <strong>Сесійні cookie:</strong> Потрібні для того, щоб ви залишалися авторизованими на сайті.
                            </li>
                            <li>
                                <strong>Аналітичні cookie:</strong> Допомагають нам зрозуміти, як користувачі взаємодіють із сайтом (Google Analytics).
                            </li>
                        </ul>
                        <p>
                            <strong>4.2.</strong> Ви можете вимкнути cookie в налаштуваннях свого браузера, однак у цьому випадку деякі функції Сайту (наприклад, Кошик) можуть працювати некоректно.
                        </p>
                    </section>

                    <section className="policy-section">
                        <h2>5. ЗАХИСТ ДАНИХ</h2>
                        <p>
                            <strong>5.1.</strong> Ми вживаємо всіх необхідних технічних та організаційних заходів для захисту ваших даних від несанкціонованого доступу, втрати або зміни.
                        </p>
                        <p>
                            <strong>5.2.</strong> Паролі користувачів зберігаються у зашифрованому вигляді (хешування) і недоступні Адміністрації сайту.
                        </p>
                        <p>
                            <strong>5.3.</strong> Сайт використовує протокол захищеної передачі даних HTTPS (SSL-сертифікат).
                        </p>
                    </section>

                    <section className="policy-section">
                        <h2>6. ПРАВА КОРИСТУВАЧА</h2>
                        <p>
                            Згідно із Законом України «Про захист персональних даних», ви маєте право:
                        </p>
                        <ul>
                            <li>Знати, які дані про вас ми зберігаємо.</li>
                            <li>Вимагати виправлення невірних даних.</li>
                            <li>Вимагати повного видалення ваших персональних даних («право на забуття»).</li>
                            <li>Відкликати згоду на обробку даних.</li>
                        </ul>
                        <p>
                            Для реалізації цих прав зв'яжіться з нами за адресою: [ВАШ EMAIL].
                        </p>
                    </section>

                    <section className="policy-section">
                        <h2>7. ЗМІНИ В ПОЛІТИЦІ</h2>
                        <p>
                            <strong>7.1.</strong> Адміністрація залишає за собою право вносити зміни до цієї Політики. Нова редакція набирає чинності з моменту її розміщення на Сайті.
                        </p>
                    </section>
                </div>
            </div>

            <style jsx>{`
        .privacy-policy-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 60px 20px;
        }

        .privacy-policy-wrapper {
          max-width: 900px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          padding: 50px;
        }

        .privacy-policy-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 30px;
          text-align: center;
          line-height: 1.3;
          border-bottom: 3px solid #6b73ff;
          padding-bottom: 20px;
        }

        .privacy-policy-content {
          color: #333;
          line-height: 1.8;
          font-size: 1.05rem;
        }

        .intro-text {
          margin-bottom: 20px;
          color: #555;
          font-size: 1.1rem;
        }

        .policy-section {
          margin: 40px 0;
          padding: 25px;
          background: #f9fafb;
          border-radius: 12px;
          border-left: 4px solid #6b73ff;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .policy-section:hover {
          transform: translateX(5px);
          box-shadow: 0 4px 15px rgba(107, 115, 255, 0.15);
        }

        .policy-section h2 {
          font-size: 1.6rem;
          font-weight: 600;
          color: #1a1a2e;
          margin-bottom: 20px;
          margin-top: 0;
        }

        .policy-section p {
          margin: 15px 0;
        }

        .policy-section ul {
          margin: 15px 0;
          padding-left: 25px;
        }

        .policy-section li {
          margin: 12px 0;
          color: #444;
        }

        .policy-section strong {
          color: #1a1a2e;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .privacy-policy-wrapper {
            padding: 30px 20px;
          }

          .privacy-policy-title {
            font-size: 1.8rem;
          }

          .privacy-policy-content {
            font-size: 1rem;
          }

          .policy-section {
            padding: 20px;
          }

          .policy-section h2 {
            font-size: 1.3rem;
          }
        }
      `}</style>
        </div>
    );
}
