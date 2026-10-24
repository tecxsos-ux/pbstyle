import asyncio
import datetime
from app.core.database import AsyncSessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.models import (
    Category, Product, ProductImage, ProductVariant, Review, Customer, DiscountCode, AdminUser, Order, OrderItem,
    InstagramSettings, InstagramPost
)
from sqlalchemy import select, func

from sqlalchemy import text

async def seed_data():
    async with engine.begin() as conn:
        await conn.execute(text("DROP SCHEMA public CASCADE;"))
        await conn.execute(text("CREATE SCHEMA public;"))
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # 1. Ensure Admin Account
        admin_res = await session.execute(select(AdminUser).where(AdminUser.email == "admin@pbstyle.ch"))
        admin = admin_res.scalar_one_or_none()
        if not admin:
            print("Creating default PBSTYLE Admin Account (admin@pbstyle.ch)...")
            admin = AdminUser(
                email="admin@pbstyle.ch",
                hashed_password=get_password_hash("PBstyle2026!Admin"),
                full_name="Philippe Bernasconi (Atelier Director)",
                role="superadmin",
                is_active=True
            )
            session.add(admin)
            await session.flush()
            print("Admin account created successfully!")
        else:
            print("Admin account already exists.")

        # 2. Check if products exist, otherwise seed them
        cat_res = await session.execute(select(Category))
        if not cat_res.scalars().first():
            print("Seeding PBstyle categories & products...")
            cat_schmuck = Category(
                title="Schmuck",
                handle="schmuck",
                description="Edle Schmuckobjekte aus 950er Platin, Titan und Sterlingsilber.",
                image_url="https://lh3.googleusercontent.com/aida-public/AB6AXuCdjntWv6yHbxg0CZKo2MFCwpCbZ3tA6jzNipHDUIT9H5H4IuK3iAY_NPD5QxmRxUBDoCxBSogUAskqCwEEC6f6NrRthEJiuesWt1a6wE8YCKXn1or_N8P25VW6uVKUvR65XIv0fmtpfMQJv-CFSuyKzzXIaF4xHqUViK7Gfuu7VKOIoQSum71TTYqZ2QCy-m_DQALNbi4u6gt47N8Pv9D2nZ1B8hQ_Oc6G9QPePPneuuec71cTkBgDEr3RSmr_ABMMJ1kRnIZiEgE"
            )
            cat_beauty = Category(
                title="Beauty-Tools",
                handle="beauty-tools",
                description="Kosmetische Präzisionsinstrumente aus Schweizer Chirurgenstahl.",
                image_url="https://lh3.googleusercontent.com/aida-public/AB6AXuCtRjOqjJK8dTOsrxOxl5yuTJPf0AbTeOBiKKoZFUNDv6fx-UBtt1DviExuZRQbvXfd9cRyjd_xAWa_ZxF-MUAWvuSf67DFv7j8oC5esKRpJcgQOtXqzjGjDikSBpaBCyQsV1ZSoLPG0Cgm8d3CyJewdR9bmmUxoLzs6emmWgJoBIL6smQA4esdyK6KnavJeB0UfGEThvBjcOV-wU986ofKgs5iBfKLYnkwSZddkO9wSerfcCmZAJdN501nand0PTIsUfTkJw5bQPg"
            )
            cat_neuheiten = Category(
                title="Neuheiten",
                handle="neuheiten",
                description="Avantgardistische Tresor-Editionen und Neuentwicklungen.",
                image_url="https://lh3.googleusercontent.com/aida-public/AB6AXuD8DxlyWKoj1_fug149Ux4zigrvTRaN3Vk2X7MMm3-s0i7icQIGVpaBPyjI6Y-UKEno1nDNQvoKBviFndTQYJ9tlIfH1iUtsaWc3Muk1HpTLtZb3pOSJsuuYud_RM36FSo4Vy44AHrRuS4a9HZ6lmCtDGIjDSmNLsxCjybxwShD29YlXq9BvoFGrBXeNpKyzRpIer7AqrmCVIE97dR_GgPHPuSTfL2n3SpGZkw0rH0B8FMaB6TW1SYrwLg7D1rXH0BHqb5__yjnu20"
            )
            session.add_all([cat_schmuck, cat_beauty, cat_neuheiten])
            await session.flush()

            p1 = Product(
                title="Monolith-Ring",
                handle="monolith-ring",
                subtitle="950 Platin, gebürstetes Finish",
                description="Der Monolith-Ring verkörpert die architektonische Kraft puristischer Metallurgie. Aus einem einzigen Block massiven 950er Platins kaltgeschmiedet und von Hand mit mikrofeinen Bürstenstrichen vollendet.",
                category_id=cat_schmuck.id,
                material="platinum",
                base_price=2450.0,
                cost_price=890.0,
                compare_at_price=2650.0,
                currency="CHF",
                is_featured=True,
                is_new=True,
                stock=4, # Low stock alert example
                low_stock_threshold=5,
                sku_prefix="PB-MONO",
                status="Aktiv",
                specifications={"Legierung": "Pt 950", "Dichte": "21.45 g/cm³", "Herkunft": "Zürich, Schweiz"}
            )
            p1.images = [ProductImage(image_url="https://lh3.googleusercontent.com/aida-public/AB6AXuCdjntWv6yHbxg0CZKo2MFCwpCbZ3tA6jzNipHDUIT9H5H4IuK3iAY_NPD5QxmRxUBDoCxBSogUAskqCwEEC6f6NrRthEJiuesWt1a6wE8YCKXn1or_N8P25VW6uVKUvR65XIv0fmtpfMQJv-CFSuyKzzXIaF4xHqUViK7Gfuu7VKOIoQSum71TTYqZ2QCy-m_DQALNbi4u6gt47N8Pv9D2nZ1B8hQ_Oc6G9QPePPneuuec71cTkBgDEr3RSmr_ABMMJ1kRnIZiEgE", sort_order=0)]
            p1.variants = [ProductVariant(title="Größe 56", sku="PB-MONO-56", price_offset=0.0, size="56", finish="Gebürstetes Platin", stock=2)]

            p2 = Product(
                title="Präzisionspinzette",
                handle="praezisionspinzette",
                subtitle="Japanischer Chirurgenstahl 316L",
                description="Entwickelt für allerhöchste dermatologische und kosmetische Anforderungen. Spitzen schließen mikrometergenau.",
                category_id=cat_beauty.id,
                material="brushed steel",
                base_price=85.0,
                cost_price=24.0,
                currency="CHF",
                is_featured=True,
                is_new=False,
                stock=24,
                low_stock_threshold=5,
                sku_prefix="PB-TWZ",
                status="Aktiv",
                specifications={"Stahllegierung": "Chirurgischer Edelstahl 316L", "Härtegrad": "56 HRC"}
            )
            p2.images = [ProductImage(image_url="https://lh3.googleusercontent.com/aida-public/AB6AXuCtRjOqjJK8dTOsrxOxl5yuTJPf0AbTeOBiKKoZFUNDv6fx-UBtt1DviExuZRQbvXfd9cRyjd_xAWa_ZxF-MUAWvuSf67DFv7j8oC5esKRpJcgQOtXqzjGjDikSBpaBCyQsV1ZSoLPG0Cgm8d3CyJewdR9bmmUxoLzs6emmWgJoBIL6smQA4esdyK6KnavJeB0UfGEThvBjcOV-wU986ofKgs5iBfKLYnkwSZddkO9wSerfcCmZAJdN501nand0PTIsUfTkJw5bQPg", sort_order=0)]

            p3 = Product(
                title="Linearer Anhänger",
                handle="linearer-anhaenger",
                subtitle="Massives 950 Platin an facettierter Ankerkette",
                description="Skulpturale Geometrie trifft auf fließende Eleganz. Massiver Barren-Anhänger.",
                category_id=cat_neuheiten.id,
                material="platinum",
                base_price=3800.0,
                cost_price=1250.0,
                currency="CHF",
                is_featured=True,
                is_new=True,
                stock=2, # Critical low stock alert
                low_stock_threshold=5,
                sku_prefix="PB-PEND",
                status="Aktiv",
                specifications={"Legierung": "Pt 950 (Platin)", "Kettenlänge": "60 cm"}
            )
            p3.images = [ProductImage(image_url="https://lh3.googleusercontent.com/aida-public/AB6AXuD8DxlyWKoj1_fug149Ux4zigrvTRaN3Vk2X7MMm3-s0i7icQIGVpaBPyjI6Y-UKEno1nDNQvoKBviFndTQYJ9tlIfH1iUtsaWc3Muk1HpTLtZb3pOSJsuuYud_RM36FSo4Vy44AHrRuS4a9HZ6lmCtDGIjDSmNLsxCjybxwShD29YlXq9BvoFGrBXeNpKyzRpIer7AqrmCVIE97dR_GgPHPuSTfL2n3SpGZkw0rH0B8FMaB6TW1SYrwLg7D1rXH0BHqb5__yjnu20", sort_order=0)]

            session.add_all([p1, p2, p3])
            await session.flush()

        # 3. Ensure Realistic CRM Clients
        crm_clients = [
            {
                "email": "philippe.bernasconi@pbstyle.ch",
                "full_name": "Philippe Bernasconi",
                "phone": "+41 44 211 44 88",
                "company": "Bernasconi Atelier Group",
                "address": "Bahnhofstrasse 45",
                "city": "Zürich",
                "postal_code": "8001",
                "country": "Schweiz",
                "tier": "Titanium Elite",
                "status": "VIP",
                "loyalty_points": 1450,
                "total_spent": 14850.0,
                "orders_count": 4,
                "crm_notes": "Bevorzugt unbeschichtetes 950er Platin, Ringgröße 56. Persönliche Auslieferung im Zürcher Atelier erwünscht."
            },
            {
                "email": "beatrice.keller@vontobel.ch",
                "full_name": "Béatrice Keller",
                "phone": "+41 79 340 12 90",
                "company": "Bank Vontobel AG",
                "address": "Gotthardstrasse 43",
                "city": "Zürich",
                "postal_code": "8002",
                "country": "Schweiz",
                "tier": "Platinum Member",
                "status": "Aktiv",
                "loyalty_points": 760,
                "total_spent": 7650.0,
                "orders_count": 2,
                "crm_notes": "Sammelt Titan-Armreife und dermatologische Präzisionsspatel. Geburtstag am 14. September."
            },
            {
                "email": "dr.lukas.meier@unispital.ch",
                "full_name": "Dr. med. Lukas Meier",
                "phone": "+41 61 265 25 25",
                "company": "Universitätsspital Basel",
                "address": "Spitalstrasse 21",
                "city": "Basel",
                "postal_code": "4031",
                "country": "Schweiz",
                "tier": "Gold Atelier",
                "status": "Aktiv",
                "loyalty_points": 380,
                "total_spent": 3800.0,
                "orders_count": 1,
                "crm_notes": "Schätzt die ISO 13485 Medizintechnik-Reinheit der 316L Chirurgenstahl-Instrumente."
            },
            {
                "email": "sophie.de.rochemont@geneve-haute.ch",
                "full_name": "Baronne Sophie de Rochemont",
                "phone": "+41 22 731 88 00",
                "company": "Rochemont Haute Joaillerie",
                "address": "Rue du Rhône 62",
                "city": "Genève",
                "postal_code": "1204",
                "country": "Schweiz",
                "tier": "Titanium Elite",
                "status": "VIP",
                "loyalty_points": 2240,
                "total_spent": 22400.0,
                "orders_count": 6,
                "crm_notes": "Höchste Diskretion. Wünscht maßgeschneiderte Lasergravur der Genfer Punzierung auf jedem Stück."
            }
        ]

        for cl in crm_clients:
            existing_c = await session.execute(select(Customer).where(Customer.email == cl["email"]))
            cust = existing_c.scalar_one_or_none()
            if not cust:
                new_cust = Customer(**cl)
                session.add(new_cust)
            else:
                for k, v in cl.items():
                    setattr(cust, k, v)

        await session.flush()

        # 4. Ensure Sample Invoiced Orders for Testing Invoice & Mail Dispatch
        order_check = await session.execute(select(Order))
        if not order_check.scalars().first():
            print("Creating sample luxury orders for invoicing and mail dispatch...")
            prod_sample = (await session.execute(select(Product))).scalars().first()
            sample_order1 = Order(
                order_number="PB-2026-8812",
                customer_email="beatrice.keller@vontobel.ch",
                customer_name="Béatrice Keller",
                shipping_address={"address": "Gotthardstrasse 43", "city": "Zürich", "postal_code": "8002", "country": "Schweiz"},
                subtotal=2450.0,
                discount_amount=0.0,
                shipping_cost=0.0,
                total_amount=2450.0,
                currency="CHF",
                status="Zugestellt",
                payment_method="Kreditkarte (Geschützt)",
                payment_status="Bezahlt",
                invoice_number="INV-2026-8812",
                invoice_sent=True,
                invoice_sent_at=datetime.datetime.utcnow() - datetime.timedelta(days=2),
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=2),
                items=[
                    OrderItem(
                        product_id=prod_sample.id,
                        product_title=prod_sample.title,
                        variant_title="Größe 54",
                        unit_price=2450.0,
                        quantity=1
                    )
                ]
            )

            sample_order2 = Order(
                order_number="PB-2026-9430",
                customer_email="sophie.de.rochemont@geneve-haute.ch",
                customer_name="Baronne Sophie de Rochemont",
                shipping_address={"address": "Rue du Rhône 62", "city": "Genève", "postal_code": "1204", "country": "Schweiz"},
                subtotal=3800.0,
                discount_amount=760.0, # PBSTYLE20
                shipping_cost=0.0,
                total_amount=3040.0,
                currency="CHF",
                status="Verarbeitung",
                payment_method="Banküberweisung",
                payment_status="Bezahlt",
                invoice_number="INV-2026-9430",
                invoice_sent=False, # Ready to send!
                created_at=datetime.datetime.utcnow(),
                items=[
                    OrderItem(
                        product_id=prod_sample.id,
                        product_title="Linearer Anhänger (Platin)",
                        variant_title="60cm Kette",
                        unit_price=3800.0,
                        quantity=1
                    )
                ]
            )

            session.add_all([sample_order1, sample_order2])

            # Seed Instagram Connector & Luxury Sample Posts
            ig_settings = InstagramSettings(
                account_username="@pbstyle.ch",
                business_account_id="17841405309211880",
                auto_post_enabled=True,
                auto_hashtags="#pbstyle #swissjewelry #950platin #hautejoaillerie #atelierzurich #swissmade #swissluxury",
                post_template="✨ Neu im Zürcher Atelier: {title}\n\n{subtitle}\n\n▪ Werkstoff: {material}\n▪ Toleranz: ±0.01 mm Schweizer Uhrmacher-Präzision\n▪ Preis: CHF {price} inkl. MWST\n\nDirekt im virtuellen Tresor entdecken (Link in Bio).\n\n{hashtags}",
                is_connected=True,
                last_sync_at=datetime.datetime.utcnow(),
                posts_count=2,
                followers_count=24800
            )
            session.add(ig_settings)

            post1 = InstagramPost(
                product_id=p1.id,
                instagram_media_id="18029482910293841",
                caption="✨ Neu im Zürcher Atelier: Monolith-Ring\n\n950 Platin, gebürstetes Finish\n\n▪ Werkstoff: Massives 950er Feinplatin (Pt 950)\n▪ Toleranz: ±0.01 mm Schweizer Uhrmacher-Präzision\n▪ Preis: CHF 2'450.00 inkl. MWST\n\nDirekt im virtuellen Tresor entdecken (Link in Bio).\n\n#pbstyle #swissjewelry #950platin #hautejoaillerie #atelierzurich #swissmade",
                image_url="https://lh3.googleusercontent.com/aida-public/AB6AXuCdjntWv6yHbxg0CZKo2MFCwpCbZ3tA6jzNipHDUIT9H5H4IuK3iAY_NPD5QxmRxUBDoCxBSogUAskqCwEEC6f6NrRthEJiuesWt1a6wE8YCKXn1or_N8P25VW6uVKUvR65XIv0fmtpfMQJv-CFSuyKzzXIaF4xHqUViK7Gfuu7VKOIoQSum71TTYqZ2QCy-m_DQALNbi4u6gt47N8Pv9D2nZ1B8hQ_Oc6G9QPePPneuuec71cTkBgDEr3RSmr_ABMMJ1kRnIZiEgE",
                permalink="https://www.instagram.com/p/C4829s01P/",
                status="published",
                likes_count=189,
                comments_count=14,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)
            )

            post2 = InstagramPost(
                product_id=p3.id,
                instagram_media_id="18029482910293842",
                caption="✨ Neu im Zürcher Atelier: Linearer Anhänger\n\nMassives 950 Platin an facettierter Ankerkette\n\n▪ Werkstoff: Massives 950er Feinplatin (Pt 950)\n▪ Toleranz: ±0.01 mm Schweizer Uhrmacher-Präzision\n▪ Preis: CHF 3'800.00 inkl. MWST\n\nDirekt im virtuellen Tresor entdecken (Link in Bio).\n\n#pbstyle #swissjewelry #950platin #hautejoaillerie #atelierzurich #swissmade",
                image_url="https://lh3.googleusercontent.com/aida-public/AB6AXuD8DxlyWKoj1_fug149Ux4zigrvTRaN3Vk2X7MMm3-s0i7icQIGVpaBPyjI6Y-UKEno1nDNQvoKBviFndTQYJ9tlIfH1iUtsaWc3Muk1HpTLtZb3pOSJsuuYud_RM36FSo4Vy44AHrRuS4a9HZ6lmCtDGIjDSmNLsxCjybxwShD29YlXq9BvoFGrBXeNpKyzRpIer7AqrmCVIE97dR_GgPHPuSTfL2n3SpGZkw0rH0B8FMaB6TW1SYrwLg7D1rXH0BHqb5__yjnu20",
                permalink="https://www.instagram.com/p/C4982k12X/",
                status="published",
                likes_count=234,
                comments_count=19,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=6)
            )
            session.add_all([post1, post2])

        await session.commit()
        print("PBstyle luxury database and admin environment successfully initialized!")

if __name__ == "__main__":
    asyncio.run(seed_data())
